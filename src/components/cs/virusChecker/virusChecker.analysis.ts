// virusChecker.analysis.ts
// Pure client-side analysis engine — no React, no DOM, fully testable.
// Called by virusChecker.tsx after a file is read as ArrayBuffer.

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type Verdict  = 'clean' | 'suspicious' | 'malicious';
export type DetectionCategory =
  | 'signature'
  | 'obfuscation'
  | 'suspicious-string'
  | 'entropy'
  | 'magic-mismatch';

export interface Detection {
  id:          string;
  name:        string;
  category:    DetectionCategory;
  severity:    Severity;
  byteOffset:  number;
  byteLength:  number;
  explanation: string;       // WHY it is suspicious (one sentence)
  evidence:    string;       // exact raw bytes / string that triggered it
  decoded?:    string;       // decoded payload (base64→plain, fromCharCode→str, etc.)
}

export interface EntropyBlock {
  blockIndex: number;
  offset:     number;        // first byte of block
  entropy:    number;        // 0–8 bits / byte
  label:      'low' | 'normal' | 'high' | 'critical';
}

export interface HexByteHighlight {
  col:   number;             // 0–15
  color: 'red' | 'amber' | 'blue';
}

export interface HexRow {
  offset:          number;
  bytes:           number[];  // always 16 (padded with -1 for missing bytes)
  ascii:           string;
  highlightRanges: HexByteHighlight[];
}

export interface ExtractedString {
  offset:   number;
  value:    string;
  flagged:  boolean;
  reason?:  string;
}

export interface ScanResult {
  verdict:             Verdict;
  fileName:            string;
  fileSize:            number;
  detections:          Detection[];
  entropyBlocks:       EntropyBlock[];
  hexRows:             HexRow[];        // first 22 rows — used for initial render
  extractedStrings:    ExtractedString[];
  scanDurationMs:      number;
  magicBytesDetected:  string | null;
  declaredExtension:   string;
  extensionMismatch:   boolean;
  textRatio:           number;          // 0–1 proportion of printable ASCII bytes
}

// Internal database types
interface SignatureEntry {
  id:           string;
  name:         string;
  binaryPattern?: number[];   // match raw bytes (null-safe)
  textPattern?:   string;     // match decoded Latin-1 text
  severity:     Severity;
  explanation:  string;
}

interface ObfuscationPattern {
  id:          string;
  name:        string;
  regex:       RegExp;
  severity:    Severity;
  explanation: string;
  decoder?:    (match: string) => string | undefined;
}

interface SuspiciousStringEntry {
  id:          string;
  pattern:     string;         // lowercase for case-insensitive matching
  name:        string;
  severity:    Severity;
  explanation: string;
}

interface MagicByteEntry {
  header:      number[];
  description: string;
  extensions:  string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNATURE DATABASE
// ─────────────────────────────────────────────────────────────────────────────

const SIGNATURE_DB: SignatureEntry[] = [
  {
    id: 'eicar-text',
    name: 'EICAR Antivirus Test File',
    textPattern: 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*',
    severity: 'critical',
    explanation:
      'The EICAR standard test file signature — every antivirus product recognises this pattern. ' +
      'Its presence confirms signature-based detection is working.',
  },
  {
    id: 'eicar-bytes',
    name: 'EICAR Header Bytes',
    binaryPattern: [0x58, 0x35, 0x4F, 0x21, 0x50, 0x25, 0x40, 0x41, 0x50],  // X5O!P%@AP
    severity: 'critical',
    explanation: 'Binary-level EICAR header bytes detected — matches the standard antivirus test file.',
  },
  {
    id: 'wannacry',
    name: 'WannaCry Kill-switch Domain',
    textPattern: 'iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com',
    severity: 'critical',
    explanation:
      'WannaCry ransomware embedded the URL of its own kill-switch: if this domain was reachable it would halt encryption. ' +
      'Presence in any file strongly indicates a WannaCry sample.',
  },
  {
    id: 'mimikatz',
    name: 'Mimikatz Credential Dumper',
    textPattern: 'sekurlsa::logonpasswords',
    severity: 'critical',
    explanation:
      'Mimikatz command to dump Windows credentials from LSASS memory. ' +
      'This string only appears in credential-theft tooling.',
  },
  {
    id: 'mz-embedded',
    name: 'Embedded PE Executable Header',
    binaryPattern: [0x4D, 0x5A, 0x90, 0x00],  // MZ header
    severity: 'high',
    explanation:
      'An MZ / PE executable header was found inside the file body — ' +
      'a dropper often embeds a second executable that it writes to disk and runs.',
  },
  {
    id: 'elf-embedded',
    name: 'Embedded ELF Binary',
    binaryPattern: [0x7F, 0x45, 0x4C, 0x46],  // \x7fELF
    severity: 'high',
    explanation:
      'Linux ELF binary magic bytes found inside the file — ' +
      'indicates a cross-platform dropper carrying a native Linux payload.',
  },
  {
    id: 'metasploit',
    name: 'Metasploit Framework Marker',
    textPattern: 'MSFRE',
    severity: 'high',
    explanation:
      'Metasploit Framework reverse-shell marker. ' +
      'Metasploit is the most widely-used exploitation framework; staged payloads carry this string.',
  },
  {
    id: 'cobalt-strike',
    name: 'Cobalt Strike Beacon Marker',
    textPattern: 'beacon.dll',
    severity: 'critical',
    explanation:
      'Cobalt Strike beacon DLL marker — Cobalt Strike is a commercial post-exploitation framework ' +
      'frequently used by ransomware groups for lateral movement.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// OBFUSCATION PATTERNS
// Only run on text-like files (textRatio > 0.35) — binary files produce
// thousands of false positives when decoded patterns are searched as text.
// ─────────────────────────────────────────────────────────────────────────────

const OBFUSCATION_PATTERNS: ObfuscationPattern[] = [
  {
    id: 'eval-atob',
    name: 'eval(atob(…)) — Execute Hidden Payload',
    regex: /eval\s*\(\s*atob\s*\(\s*['"`]([A-Za-z0-9+/=]+)['"`]\s*\)/gi,
    severity: 'critical',
    explanation:
      'atob() decodes a Base64 string and eval() immediately executes the result. ' +
      'This pattern hides an entire script inside a Base64 blob to bypass text-based scanners.',
    decoder: (match) => {
      const inner = match.match(/atob\s*\(\s*['"`]([A-Za-z0-9+/=]+)['"`]/i)?.[1];
      if (!inner) return undefined;
      try { return `[Decoded] ${atob(inner)}`; } catch { return undefined; }
    },
  },
  {
    id: 'fromcharcode',
    name: 'String.fromCharCode — Character-by-Character String',
    regex: /String\.fromCharCode\s*\([\d\s,]+\)/gi,
    severity: 'high',
    explanation:
      'String.fromCharCode() rebuilds a string from an array of char-code integers at runtime. ' +
      'This evades static scanners because the actual string (often a URL or API name) never appears as a literal.',
    decoder: (match) => {
      const nums = match.match(/\d+/g);
      if (!nums) return undefined;
      try {
        return `[Decoded] "${nums.map(n => String.fromCharCode(parseInt(n))).join('')}"`;
      } catch {
        return undefined;
      }
    },
  },
  {
    id: 'ps-encoded',
    name: 'PowerShell -EncodedCommand',
    regex: /-[Ee]nc(?:odedCommand)?\s+([A-Za-z0-9+/]{20,}={0,2})/g,
    severity: 'critical',
    explanation:
      'The PowerShell -EncodedCommand flag passes a UTF-16LE Base64-encoded script to bypass ' +
      'command-line argument logging and keyword detection. Every fileless PS attack uses this.',
    decoder: (match) => {
      const b64 = match.match(/-[Ee]nc(?:odedCommand)?\s+([A-Za-z0-9+/]{20,}={0,2})/i)?.[1];
      if (!b64) return undefined;
      try {
        const raw = atob(b64);
        // UTF-16LE: byte pairs → char
        let out = '';
        for (let i = 0; i + 1 < raw.length; i += 2) {
          out += String.fromCharCode(raw.charCodeAt(i) | (raw.charCodeAt(i + 1) << 8));
        }
        return `[Decoded PS] ${out.slice(0, 200)}`;
      } catch {
        return undefined;
      }
    },
  },
  {
    id: 'hex-escape',
    name: 'Hex Escape Sequence Chain (\\xNN)',
    regex: /(?:\\x[0-9A-Fa-f]{2}){6,}/g,
    severity: 'medium',
    explanation:
      'A chain of hex escape sequences reconstructs a string byte-by-byte at runtime, ' +
      'hiding the actual content (commonly a URL, command, or shellcode) from static analysis.',
    decoder: (match) => {
      try {
        const result = match.replace(/\\x([0-9A-Fa-f]{2})/g, (_, h) =>
          String.fromCharCode(parseInt(h, 16))
        );
        return `[Decoded] "${result}"`;
      } catch {
        return undefined;
      }
    },
  },
  {
    id: 'iex',
    name: 'Invoke-Expression / IEX',
    // Case-sensitive: only match exact "IEX" (all-caps) or "Invoke-Expression".
    // Mixed-case "iex" / "Iex" is a common substring in ordinary text and creates
    // false positives on documents; genuine PowerShell malware uses all-caps IEX.
    regex: /\bInvoke-Expression\b|\bIEX\b/g,
    severity: 'high',
    explanation:
      'Invoke-Expression (IEX) evaluates any string as a PowerShell command. ' +
      'It is the core primitive in fileless malware — almost always used with -EncodedCommand or Net.WebClient.',
  },
  {
    id: 'eval-unescape',
    name: 'eval(unescape(…))',
    regex: /eval\s*\(\s*unescape\s*\(/gi,
    severity: 'critical',
    explanation:
      'unescape() decodes URL-percent-encoded content and eval() executes it. ' +
      'An older technique still found in malicious JS embedded in HTML or PDF files.',
  },
  {
    id: 'reflect-load',
    name: '[Reflection].Assembly::Load',
    regex: /\[System\.Reflection\.Assembly\]::Load/gi,
    severity: 'high',
    explanation:
      'PowerShell can load a .NET assembly directly from a byte array in memory without writing to disk. ' +
      'This is the primary "fileless" technique used to run malicious DLLs undetected.',
  },
  {
    id: 'xor-loop',
    name: 'XOR Decryption Loop Pattern',
    regex: /for\s*\([^)]*\)\s*\{[^}]*\^\s*(?:0x[0-9A-Fa-f]+|\d+)[^}]*\}/g,
    severity: 'medium',
    explanation:
      'A for-loop containing XOR (^) with a constant key is the textbook pattern of a simple XOR decryption routine. ' +
      'Malware XOR-encrypts strings and shellcode to hide them from scanners.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SUSPICIOUS STRINGS
// Only run on text-like files (textRatio > 0.35).
// ─────────────────────────────────────────────────────────────────────────────

const SUSPICIOUS_STRINGS: SuspiciousStringEntry[] = [
  {
    id: 'virtual-alloc',
    pattern: 'virtualalloc',
    name: 'VirtualAlloc',
    severity: 'high',
    explanation:
      'Windows API that allocates executable memory regions. ' +
      'Used by shellcode injectors to carve out writable+executable memory before copying payload bytes.',
  },
  {
    id: 'write-process',
    pattern: 'writeprocessmemory',
    name: 'WriteProcessMemory',
    severity: 'high',
    explanation:
      'Writes bytes directly into another process\'s address space — ' +
      'the key step in classic DLL/shellcode injection attacks.',
  },
  {
    id: 'create-remote',
    pattern: 'createremotethread',
    name: 'CreateRemoteThread',
    severity: 'critical',
    explanation:
      'Creates a thread in a remote process to execute arbitrary code. ' +
      'This is the primary API-level mechanism for process injection.',
  },
  {
    id: 'wscript-shell',
    pattern: 'wscript.shell',
    name: 'WScript.Shell',
    severity: 'high',
    explanation:
      'Windows Script Host object used to spawn shell processes. ' +
      'Macro malware (VBA, VBS, JS) uses WScript.Shell to run cmd.exe or PowerShell.',
  },
  {
    id: 'hkey-run',
    pattern: 'currentversion\\run',
    name: 'HKLM/HKCU Run Key (Persistence)',
    severity: 'high',
    explanation:
      'Setting values in the Run registry key causes a program to execute on every login — ' +
      'the classic Windows persistence mechanism used by most Trojans.',
  },
  {
    id: 'xmrig',
    pattern: 'xmrig',
    name: 'XMRig Crypto-Miner',
    severity: 'critical',
    explanation:
      'XMRig is an open-source Monero miner routinely bundled by malware ' +
      'as a crypto-jacking payload on victim machines.',
  },
  {
    id: 'stratum',
    pattern: 'stratum+tcp://',
    name: 'Mining Pool Stratum URL',
    severity: 'critical',
    explanation:
      'Stratum is the protocol used to connect miners to mining pools. ' +
      'Presence of a stratum URL in a non-mining application indicates a crypto-jacking payload.',
  },
  {
    id: 'net-webclient',
    pattern: 'net.webclient',
    name: 'Net.WebClient (PowerShell Downloader)',
    severity: 'high',
    explanation:
      'PowerShell\'s WebClient is the most common way to download a second-stage payload. ' +
      'Combined with IEX it enables "download and execute" without touching disk.',
  },
  {
    id: 'cmd-chain',
    pattern: '/c powershell',
    name: 'CMD→PowerShell Execution Chain',
    severity: 'high',
    explanation:
      'Spawning PowerShell from cmd.exe (/c powershell) is a classic living-off-the-land technique ' +
      'used to execute PowerShell from macros, scheduled tasks, and shortcut files.',
  },
  {
    id: 'rundll32',
    pattern: 'rundll32',
    name: 'RunDLL32 Invocation',
    severity: 'medium',
    explanation:
      'RunDLL32.exe executes DLL exports from the command line. ' +
      'It is widely abused to run malicious DLLs without a visible executable file.',
  },
  {
    id: 'regsvr32',
    pattern: 'regsvr32',
    name: 'Regsvr32 COM Squiblydoo',
    severity: 'medium',
    explanation:
      'Regsvr32 can execute remote .sct scripts (Squiblydoo technique), ' +
      'bypassing AppLocker and loading code without writing a file to disk.',
  },
  {
    id: 'crypt-provider',
    pattern: 'cryptoserviceprovider',
    name: 'CryptoServiceProvider (Ransomware Indicator)',
    severity: 'medium',
    explanation:
      '.NET CryptoServiceProvider encrypts/decrypts data. ' +
      'Combined with file enumeration patterns, it is a strong ransomware indicator.',
  },
  {
    id: 'subprocess-import',
    pattern: '__import__("subprocess")',
    name: 'Python Dynamic subprocess Import',
    severity: 'medium',
    explanation:
      'Dynamically importing subprocess in Python hides shell-execution capability from static linters. ' +
      'Common in Python-based RATs and crypto-jackers.',
  },
  {
    id: 'certutil',
    pattern: 'certutil',
    name: 'CertUtil (LOLBin Downloader)',
    severity: 'high',
    explanation:
      'Windows Certificate Utility (certutil.exe) is a LOLBin (living-off-the-land binary) ' +
      'frequently abused to download and Base64-decode payloads using its -urlcache and -decode flags.',
  },
  {
    id: 'mshta',
    pattern: 'mshta',
    name: 'MSHTA (HTA Execution)',
    severity: 'high',
    explanation:
      'MSHTA.exe executes HTML Application (.hta) files, which can run arbitrary VBScript or JScript. ' +
      'A classic bypass for application whitelisting controls.',
  },
  {
    id: 'shellcode-nop',
    pattern: '\x90\x90\x90\x90\x90\x90\x90\x90',
    name: 'NOP Sled (Shellcode Indicator)',
    severity: 'high',
    explanation:
      'A long sequence of NOP (0x90) instructions is a classic shellcode landing pad — ' +
      'the "NOP sled" ensures execution hits the payload regardless of minor memory offset variations.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAGIC BYTES
// ─────────────────────────────────────────────────────────────────────────────

const MAGIC_BYTES: MagicByteEntry[] = [
  { header: [0x4D, 0x5A],             description: 'PE Executable (MZ)',       extensions: ['.exe', '.dll', '.sys', '.scr', '.com', '.drv'] },
  { header: [0x7F, 0x45, 0x4C, 0x46], description: 'ELF Binary (Linux/Unix)',  extensions: ['.elf', '.so', '.bin', ''] },
  { header: [0x25, 0x50, 0x44, 0x46], description: 'PDF Document',             extensions: ['.pdf'] },
  { header: [0x50, 0x4B, 0x03, 0x04], description: 'ZIP Archive / Office Doc', extensions: ['.zip', '.docx', '.xlsx', '.pptx', '.jar', '.apk', '.odt', '.ods'] },
  { header: [0xD0, 0xCF, 0x11, 0xE0], description: 'OLE2 Compound Document',   extensions: ['.doc', '.xls', '.ppt', '.msg', '.pub'] },
  { header: [0x89, 0x50, 0x4E, 0x47], description: 'PNG Image',                extensions: ['.png'] },
  { header: [0xFF, 0xD8, 0xFF],       description: 'JPEG Image',               extensions: ['.jpg', '.jpeg'] },
  { header: [0x1F, 0x8B],             description: 'GZIP Archive',             extensions: ['.gz', '.tgz', '.tar.gz'] },
  { header: [0xFE, 0xED, 0xFA, 0xCE], description: 'Mach-O 32-bit Binary',    extensions: ['.dylib', '.macho', ''] },
  { header: [0xFE, 0xED, 0xFA, 0xCF], description: 'Mach-O 64-bit Binary',    extensions: ['.dylib', '.macho', ''] },
  { header: [0xCA, 0xFE, 0xBA, 0xBE], description: 'Java Class File',          extensions: ['.class'] },
  { header: [0x52, 0x61, 0x72, 0x21], description: 'RAR Archive',              extensions: ['.rar'] },
  { header: [0x37, 0x7A, 0xBC, 0xAF], description: '7-Zip Archive',            extensions: ['.7z'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// STRINGS EXTRACTION & DYNAMIC HEX BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/** Patterns that flag a string as suspicious in the strings tab. */
const FLAGGED_PATTERNS: Array<{ regex: RegExp; reason: string }> = [
  { regex: /https?:\/\//i,                                         reason: 'URL' },
  { regex: /[A-Za-z]:\\[A-Za-z]/,                                  reason: 'Windows path' },
  { regex: /\/etc\/|\/tmp\/|\/bin\/|\/usr\//,                      reason: 'Unix path' },
  { regex: /cmd\.exe|powershell|wscript\.shell|cscript/i,          reason: 'Shell cmd' },
  { regex: /HKEY_|HKLM\\|HKCU\\/,                                  reason: 'Registry key' },
  { regex: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,                 reason: 'IP address' },
  { regex: /virtualalloc|writeprocessmemory|createremotethread/i,  reason: 'Injection API' },
  { regex: /eval\s*\(|atob\s*\(|fromcharcode|encodedcommand/i,     reason: 'Obfuscation' },
  { regex: /\.(exe|dll|bat|vbs|ps1|sh|msi|scr)(?:[^A-Za-z]|$)/i, reason: 'Executable ref' },
  { regex: /stratum\+tcp|xmrig|monero/i,                           reason: 'Mining indicator' },
];

/**
 * Extract printable ASCII strings (like Unix `strings`).
 * Capped at 2 000 results to stay responsive on large binaries.
 */
export function extractPrintableStrings(
  bytes: Uint8Array,
  minLength = 6,
): ExtractedString[] {
  const MAX = 2000;
  const results: ExtractedString[] = [];
  let start   = -1;
  let current = '';

  const flush = () => {
    if (current.length >= minLength && results.length < MAX) {
      let flagged = false;
      let reason: string | undefined;
      for (const p of FLAGGED_PATTERNS) {
        if (p.regex.test(current)) { flagged = true; reason = p.reason; break; }
      }
      results.push({ offset: start, value: current, flagged, reason });
    }
    start   = -1;
    current = '';
  };

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b >= 0x20 && b <= 0x7E) {
      if (start < 0) start = i;
      current += String.fromCharCode(b);
    } else {
      if (current.length > 0) flush();
    }
    if (results.length >= MAX) break;
  }
  if (current.length > 0) flush();

  return results;
}

/**
 * Build hex rows starting at `rowOffset` (0-indexed row number).
 * Exported so the UI can re-render the viewer when the user navigates or clicks a detection.
 * Only colours bytes in the visible window → O(detections × windowBytes), not O(fileSize).
 */
export function buildHexRowsDynamic(
  bytes:      Uint8Array,
  detections: Detection[],
  rowOffset:  number,
  numRows    = 18,
): HexRow[] {
  const totalRows = Math.ceil(bytes.length / 16);
  const startRow  = Math.max(0, Math.min(rowOffset, totalRows > 0 ? totalRows - 1 : 0));
  const endRow    = Math.min(startRow + numRows, totalRows);
  const winStart  = startRow * 16;
  const winEnd    = endRow   * 16;

  // Color-map only for bytes inside the visible window
  const colorMap = new Map<number, 'red' | 'amber' | 'blue'>();
  for (const d of detections) {
    const color: 'red' | 'amber' | 'blue' =
      d.severity === 'critical' || d.severity === 'high' ? 'red'   :
      d.severity === 'medium'                            ? 'amber' : 'blue';
    const oStart = Math.max(d.byteOffset, winStart);
    const oEnd   = Math.min(d.byteOffset + d.byteLength, winEnd);
    for (let i = oStart; i < oEnd; i++) {
      const existing = colorMap.get(i);
      if (!existing || color === 'red' || (color === 'amber' && existing === 'blue')) {
        colorMap.set(i, color);
      }
    }
  }

  const rows: HexRow[] = [];
  for (let r = startRow; r < endRow; r++) {
    const offset    = r * 16;
    const rowBytes: number[] = [];
    let   ascii     = '';
    const highlights: HexByteHighlight[] = [];

    for (let col = 0; col < 16; col++) {
      const bp = offset + col;
      if (bp < bytes.length) {
        const b = bytes[bp];
        rowBytes.push(b);
        ascii += b >= 32 && b < 127 ? String.fromCharCode(b) : '.';
        const c = colorMap.get(bp);
        if (c) highlights.push({ col, color: c });
      } else {
        rowBytes.push(-1);
      }
    }
    rows.push({ offset, bytes: rowBytes, ascii, highlightRanges: highlights });
  }
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Shannon entropy of a byte array in bits/byte (0–8). */
export function shannonEntropy(bytes: Uint8Array): number {
  const freq = new Uint32Array(256);
  for (const b of bytes) freq[b]++;
  let h = 0;
  const n = bytes.length;
  if (n === 0) return 0;
  for (let i = 0; i < 256; i++) {
    if (freq[i] > 0) {
      const p = freq[i] / n;
      h -= p * Math.log2(p);
    }
  }
  return h;
}

/** Format a small byte array as "XX XX XX ..." hex string. */
function formatHex(bytes: Uint8Array | number[], maxBytes = 16): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(arr.subarray(0, maxBytes))
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

/** Extract file extension from filename, lowercase with dot, e.g. ".exe". */
function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : '';
}

/** Severity ordering for comparison. */
const SEV_ORDER: Record<Severity, number> = {
  info: 0, low: 1, medium: 2, high: 3, critical: 4,
};

function maxSeverity(detections: Detection[]): Severity {
  if (detections.length === 0) return 'info';
  return detections.reduce<Severity>((max, d) =>
    SEV_ORDER[d.severity] > SEV_ORDER[max] ? d.severity : max,
    'info'
  );
}

/**
 * Search for a byte-pattern in a Uint8Array.
 * Returns the first match offset, or -1.
 */
function findBinaryPattern(haystack: Uint8Array, needle: number[]): number {
  if (needle.length === 0 || haystack.length < needle.length) return -1;
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

/**
 * Finalize detections with per-category caps and deduplication.
 *
 * Steps:
 *  1. Sort by severity descending (critical first).
 *  2. Deduplicate within the same 256-byte block + category (keep highest sev).
 *  3. Apply hard caps per category to prevent flooding:
 *       signature         ≤ 10
 *       obfuscation       ≤  5
 *       suspicious-string ≤  5
 *       entropy           ≤  4
 *       magic-mismatch    ≤  1
 */
const CATEGORY_CAPS: Record<DetectionCategory, number> = {
  'signature':          10,
  'obfuscation':         5,
  'suspicious-string':   5,
  'entropy':             4,
  'magic-mismatch':      1,
};

function finalizeDetections(detections: Detection[]): Detection[] {
  // Sort: highest severity first
  const sorted = [...detections].sort(
    (a, b) => SEV_ORDER[b.severity] - SEV_ORDER[a.severity]
  );

  // Deduplicate: within same 256-byte block + category, keep highest severity only
  const blockSeen = new Map<string, Detection>();
  for (const d of sorted) {
    const key = `${d.category}:${Math.floor(d.byteOffset / 256)}`;
    if (!blockSeen.has(key)) blockSeen.set(key, d);
  }

  // Apply per-category caps
  const counts: Partial<Record<DetectionCategory, number>> = {};
  const result: Detection[] = [];
  for (const d of blockSeen.values()) {
    const cat = d.category;
    const count = counts[cat] ?? 0;
    if (count < CATEGORY_CAPS[cat]) {
      result.push(d);
      counts[cat] = count + 1;
    }
  }

  // Final sort: critical first
  return result.sort((a, b) => SEV_ORDER[b.severity] - SEV_ORDER[a.severity]);
}

/** Build hex rows for the viewer (first `maxRows × 16` bytes). */
function buildHexRows(
  bytes: Uint8Array,
  detections: Detection[],
  maxRows = 18
): HexRow[] {
  // Build color-map for highlighted byte offsets
  const colorMap = new Map<number, 'red' | 'amber' | 'blue'>();
  for (const d of detections) {
    const color: 'red' | 'amber' | 'blue' =
      d.severity === 'critical' || d.severity === 'high' ? 'red' :
      d.severity === 'medium' ? 'amber' : 'blue';
    for (let i = d.byteOffset; i < d.byteOffset + d.byteLength && i < maxRows * 16; i++) {
      // Higher severity wins if already mapped
      const existing = colorMap.get(i);
      if (!existing || (color === 'red') || (color === 'amber' && existing === 'blue')) {
        colorMap.set(i, color);
      }
    }
  }

  const totalRows = Math.min(maxRows, Math.ceil(bytes.length / 16));
  const rows: HexRow[] = [];

  for (let r = 0; r < totalRows; r++) {
    const offset = r * 16;
    const rowBytes: number[] = [];
    let ascii = '';
    const highlights: HexByteHighlight[] = [];

    for (let col = 0; col < 16; col++) {
      const byteOffset = offset + col;
      if (byteOffset < bytes.length) {
        const b = bytes[byteOffset];
        rowBytes.push(b);
        ascii += b >= 32 && b < 127 ? String.fromCharCode(b) : '.';
        const color = colorMap.get(byteOffset);
        if (color) highlights.push({ col, color });
      } else {
        rowBytes.push(-1); // padding
      }
    }

    rows.push({ offset, bytes: rowBytes, ascii, highlightRanges: highlights });
  }
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ANALYSIS FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analyse a file for malware indicators.
 * Runs entirely in the browser main thread — no server, no network.
 * Typically completes in < 200 ms for files up to 50 MB.
 */
export function analyzeFile(buffer: ArrayBuffer, fileName: string): ScanResult {
  const t0    = Date.now();
  const bytes = new Uint8Array(buffer);

  // Latin-1 / windows-1252 preserves every byte 0–255 as a character.
  // Using UTF-8 would silently corrupt many binary bytes.
  const text  = new TextDecoder('windows-1252').decode(bytes);
  const ltext = text.toLowerCase();

  // ── TEXT RATIO ───────────────────────────────────────────────────────────
  // Proportion of printable ASCII bytes (0x20–0x7E).
  // Text files (scripts, HTML, config):  textRatio ≥ 0.80
  // Binary executables (PE, ELF):        textRatio ≈ 0.20–0.30
  // Threshold at 0.35 to classify file type and gate text-pattern scans.
  let printableCount = 0;
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] >= 0x20 && bytes[i] <= 0x7E) printableCount++;
  }
  const textRatio  = bytes.length > 0 ? printableCount / bytes.length : 1;
  const isTextFile = textRatio > 0.35;

  // Entropy thresholds differ by file type.
  // Binary files (PE, ELF, archives): use 7.2 — packed/encrypted regions stand out clearly.
  // Text files (PDF, DOCX XML, scripts): use 7.4 — natural dense Unicode/compressed streams
  //   in documents routinely hit 7.2–7.35 bits/byte without being malicious, so we raise
  //   the bar to avoid false positives on legitimate documents like resumes or reports.
  const ENTROPY_HIGH_THRESHOLD = isTextFile ? 7.4 : 7.2;

  const detections: Detection[] = [];

  // ── 1. ENTROPY ANALYSIS ──────────────────────────────────────────────────
  // Compute per-block entropy, then merge adjacent high-entropy blocks into
  // contiguous regions so we emit ONE detection per region rather than one
  // per 256-byte chunk. This dramatically reduces noise.
  const BLOCK = 256;
  const entropyBlocks: EntropyBlock[] = [];

  for (let i = 0; i * BLOCK < bytes.length; i++) {
    const block = bytes.subarray(i * BLOCK, Math.min((i + 1) * BLOCK, bytes.length));
    const e = shannonEntropy(block);
    const label: EntropyBlock['label'] =
      e >= 7.8 ? 'critical' : e >= ENTROPY_HIGH_THRESHOLD ? 'high' : e >= 5.0 ? 'normal' : 'low';
    entropyBlocks.push({ blockIndex: i, offset: i * BLOCK, entropy: e, label });
  }

  // Merge consecutive high/critical blocks into regions
  type Region = { start: number; end: number; entropies: number[] };
  const regions: Region[] = [];
  let currentRegion: Region | null = null;

  for (const blk of entropyBlocks) {
    if (blk.label === 'high' || blk.label === 'critical') {
      if (!currentRegion) currentRegion = { start: blk.offset, end: blk.offset + BLOCK, entropies: [] };
      currentRegion.end = blk.offset + BLOCK;
      currentRegion.entropies.push(blk.entropy);
    } else {
      if (currentRegion) { regions.push(currentRegion); currentRegion = null; }
    }
  }
  if (currentRegion) regions.push(currentRegion);

  for (const reg of regions) {
    const avg = reg.entropies.reduce((a, b) => a + b, 0) / reg.entropies.length;
    const maxH = Math.max(...reg.entropies);
    const byteLen = reg.end - reg.start;
    detections.push({
      id:          `entropy-region-0x${reg.start.toString(16).toUpperCase()}`,
      name:        `Compressed / Encrypted Region`,
      category:    'entropy',
      severity:    maxH >= 7.8 ? 'high' : 'medium',
      byteOffset:  reg.start,
      byteLength:  byteLen,
      explanation:
        `Bytes 0x${reg.start.toString(16).toUpperCase()}–0x${reg.end.toString(16).toUpperCase()} ` +
        `(${byteLen.toLocaleString()} bytes across ${reg.entropies.length} blocks) have ` +
        `average entropy ${avg.toFixed(2)} bits/byte (peak ${maxH.toFixed(2)}). ` +
        `Values above 7.2 indicate packed, compressed, or encrypted content — ` +
        `malware packers use this to conceal payloads from static scanners.`,
      evidence: `${reg.entropies.length} × 256-byte blocks · avg ${avg.toFixed(3)} · peak ${maxH.toFixed(3)} bits/byte`,
    });
  }

  // ── 2. SIGNATURE SCAN ────────────────────────────────────────────────────
  // Signature scanning always runs (binary patterns for binary files,
  // text patterns only when the text-decoded content makes sense).
  for (const sig of SIGNATURE_DB) {
    if (sig.textPattern) {
      const idx = text.indexOf(sig.textPattern);
      if (idx >= 0) {
        detections.push({
          id:          `sig-${sig.id}`,
          name:        sig.name,
          category:    'signature',
          severity:    sig.severity,
          byteOffset:  idx,
          byteLength:  sig.textPattern.length,
          explanation: sig.explanation,
          evidence:    text.slice(idx, idx + Math.min(sig.textPattern.length, 80)),
        });
      }
    }
    if (sig.binaryPattern) {
      const idx = findBinaryPattern(bytes, sig.binaryPattern);
      if (idx >= 0) {
        detections.push({
          id:          `sig-bin-${sig.id}`,
          name:        sig.name,
          category:    'signature',
          severity:    sig.severity,
          byteOffset:  idx,
          byteLength:  sig.binaryPattern.length,
          explanation: sig.explanation,
          evidence:    formatHex(bytes.subarray(idx, idx + sig.binaryPattern.length)),
        });
      }
    }
  }

  // ── 3. OBFUSCATION DETECTION ─────────────────────────────────────────────
  // Only run on text-like files. Binary files (PE, ELF, images) decoded as
  // windows-1252 produce byte sequences that match obfuscation regexes
  // (e.g. long alphanumeric runs matching base64, unicode-escape patterns),
  // generating thousands of meaningless false-positive detections.
  if (isTextFile) {
    for (const pat of OBFUSCATION_PATTERNS) {
      pat.regex.lastIndex = 0;  // critical: reset global regex before each scan
      let match = pat.regex.exec(text);
      let matchCount = 0;
      while (match !== null && matchCount < 3) {  // max 3 per pattern to avoid flooding
        const decoded = pat.decoder ? pat.decoder(match[0]) : undefined;
        detections.push({
          id:          `obf-${pat.id}-${match.index}`,
          name:        pat.name,
          category:    'obfuscation',
          severity:    pat.severity,
          byteOffset:  match.index,
          byteLength:  match[0].length,
          explanation: pat.explanation,
          evidence:    match[0].slice(0, 120),
          decoded:     decoded?.slice(0, 300),
        });
        matchCount++;
        match = pat.regex.exec(text);
      }
    }
  }

  // ── 4. SUSPICIOUS STRINGS ────────────────────────────────────────────────
  // Also gated on isTextFile — these are text string patterns that have no
  // meaning in binary data. Binary files will contain random byte sequences
  // that happen to spell out these strings as windows-1252 artifacts.
  if (isTextFile) {
    for (const entry of SUSPICIOUS_STRINGS) {
      const idx = ltext.indexOf(entry.pattern.toLowerCase());
      if (idx >= 0) {
        // Show 20 chars of context before and after
        const ctxStart = Math.max(0, idx - 20);
        const ctxEnd   = Math.min(text.length, idx + entry.pattern.length + 20);
        detections.push({
          id:          `sus-${entry.id}-${idx}`,
          name:        entry.name,
          category:    'suspicious-string',
          severity:    entry.severity,
          byteOffset:  idx,
          byteLength:  entry.pattern.length,
          explanation: entry.explanation,
          evidence:    text.slice(ctxStart, ctxEnd),
        });
      }
    }
  }

  // ── 5. MAGIC BYTE vs EXTENSION MISMATCH ─────────────────────────────────
  const ext               = getExtension(fileName);
  let magicBytesDetected: string | null = null;
  let extensionMismatch                 = false;

  for (const magic of MAGIC_BYTES) {
    let matches = true;
    for (let i = 0; i < magic.header.length; i++) {
      if (bytes[i] !== magic.header[i]) { matches = false; break; }
    }
    if (matches) {
      magicBytesDetected = magic.description;
      if (ext && !magic.extensions.includes(ext)) {
        extensionMismatch = true;
        detections.push({
          id:          'magic-mismatch',
          name:        'Magic Byte / Extension Mismatch',
          category:    'magic-mismatch',
          severity:    'high',
          byteOffset:  0,
          byteLength:  magic.header.length,
          explanation:
            `File begins with ${magic.description} header bytes but has extension "${ext}". ` +
            `Attackers rename executables (e.g. rename .exe → .pdf) to bypass extension-based blocking.`,
          evidence:    formatHex(new Uint8Array(magic.header)),
        });
      }
      break;
    }
  }

  // ── 6. FINALIZE & BUILD HEX ROWS ─────────────────────────────────────────
  // finalizeDetections: deduplicates within 256-byte blocks, then applies
  // per-category caps so no single category floods the results list.
  const finalized = finalizeDetections(detections);
  const hexRows   = buildHexRows(bytes, finalized, 22);

  // ── 7. VERDICT ────────────────────────────────────────────────────────────
  const topSev = maxSeverity(finalized);
  const verdict: Verdict =
    topSev === 'critical' || topSev === 'high' ? 'malicious' :
    topSev === 'medium'   || finalized.length > 0 ? 'suspicious' :
    'clean';

  return {
    verdict,
    fileName,
    fileSize:            bytes.length,
    detections:          finalized,
    entropyBlocks,
    hexRows,
    extractedStrings:    extractPrintableStrings(bytes, 6),
    scanDurationMs:      Date.now() - t0,
    magicBytesDetected,
    declaredExtension:   ext,
    extensionMismatch,
    textRatio,
  };
}
