/******************************************************
 *               LeetCode Study Sheet
 *        Algorithms & Data Structures (TS)
 * 
 * Sections:
 * 1. Bit Manipulation
 * 2. Strings / Binary Arithmetic
 * 3. Array Manipulation
 * 4. Math / Greedy
 * 5. Heap / Median from Stream
 ******************************************************/

import { Josefin_Slab } from "next/font/google";
import { MdMoney } from "react-icons/md";

/**********************
 * 1️⃣ Bit Manipulation
 **********************/

/**
 * Reverse bits of a 32-bit unsigned integer.
 * Example: 
 * Input  : 00000010100101000001111010011100 (43261596)
 * Output : 00111001011110000010100101000000 (964176192)
 */
function reverseBits(n: number): number {
    let result = 0; // holds reversed bits

    for (let i = 0; i < 32; i++) {
        // Shift result left (make space for next bit)
        // AND with 1 to get LSB of n, then OR with result
        result = (result << 1) | (n & 1);

        // Unsigned right shift n to get next bit
        // >>> fills left bits with 0 instead of sign-extension
        n = n >>> 1;
    }

    // >>>0 ensures the result is treated as unsigned
    return result >>> 0;
}

/******************************************
 * 2️⃣ Strings / Binary Arithmetic
 ******************************************/

/**
 * Add two binary strings and return sum as a binary string.
 * Manual addition from right to left (like adding decimal numbers).
 * 
 * Example:
 * a = "1010", b = "1011"
 * Step 1: add LSBs: 0+1=1, no carry
 * Step 2: next: 1+1=0, carry=1
 * Step 3: continue...
 */
function addBinary(a: string, b: string): string {
    let i = a.length - 1; // pointer to end of a
    let j = b.length - 1; // pointer to end of b
    let carry = 0;
    const res: string[] = [];

    while (i >= 0 || j >= 0 || carry) {
        const bitA = i >= 0 ? Number(a[i]) : 0; // 0 if exhausted
        const bitB = j >= 0 ? Number(b[j]) : 0; // 0 if exhausted

        const sum = bitA + bitB + carry;
        res.push(String(sum % 2));   // current bit
        carry = Math.floor(sum / 2); // carry for next bit

        i--; j--;
    }

    // Reverse because we built result from LSB → MSB
    return res.reverse().join('');
}

/**********************
 * 3️⃣ Array Manipulation
 **********************/

/**
 * Merge nums2 into nums1 in-place.
 * We start from the end to avoid overwriting elements in nums1.
 * 
 * Example:
 * nums1 = [1,2,3,0,0,0], m=3
 * nums2 = [2,5,6], n=3
 * Result: [1,2,2,3,5,6]
 */
function merge(nums1: number[], m: number, nums2: number[], n: number): void {
    let i = m - 1, j = n - 1, k = m + n - 1;

    while (i >= 0 && j >= 0) {
        nums1[k--] = nums1[i] > nums2[j] ? nums1[i--] : nums2[j--];
    }
    // Copy remaining nums2 if any
    while (j >= 0) nums1[k--] = nums2[j--];
}

/**
 * Remove all instances of val from nums in-place.
 * Replaces the element with the last element and decreases length.
 */
function removeElement(nums: number[], val: number): number {
    let i = 0, n = nums.length;

    while (i < n) {
        if (nums[i] === val) {
            nums[i] = nums[n - 1]; // replace with last
            n--;
        } else i++;
    }

    return n; // new array length
}

/**
 * Remove duplicates from sorted array (allow only 1 instance).
 * Use two pointers technique.
 */
function removeDuplicates(nums: number[]): number {
    if (nums.length === 0) return 0;

    let k = 1; // index of next unique element

    for (let i = 1; i < nums.length; i++) {
        if (nums[i] !== nums[i - 1]) {
            nums[k++] = nums[i]; // move unique element forward
        }
    }

    return k; // number of unique elements
}

/**
 * Remove duplicates from sorted array (allow up to 2 instances).
 */
function removeDuplicatesTwiceRepeating(nums: number[]): number {
    let k = 0;

    for (let i = 0; i < nums.length; i++) {
        // allow element if first two or larger than element at k-2
        if (k < 2 || nums[i] > nums[k - 2]) {
            nums[k++] = nums[i];
        }
    }

    return k;
}

/**
 * Rotate array to the right by k steps in-place.
 * Uses reverse trick: reverse whole array, reverse first k, reverse remaining.
 */
function rotate(nums: number[], k: number): void {
    const n = nums.length;
    if (n <= 1) return;
    k = k % n;
    if (k === 0) return;

    const reverse = (arr: number[], start: number, end: number) => {
        while (start < end) {
            const tmp = arr[start];
            arr[start] = arr[end];
            arr[end] = tmp;
            start++; end--;
        }
    };

    reverse(nums, 0, n - 1);   // reverse all
    reverse(nums, 0, k - 1);   // reverse first k
    reverse(nums, k, n - 1);   // reverse rest
}

/**********************
 * 4️⃣ Math / Greedy
 **********************/

/**
 * Find majority element in array using Moore's Voting Algorithm.
 * The element appears > n/2 times.
 * Intuition: count cancels out non-majority elements.
 */
function majorityElement(nums: number[]): number {
    let candidate = nums[0];
    let count = 0;

    for (const num of nums) {
        if (count === 0) {
            candidate = num;
            count = 1;
        } else if (num === candidate) {
            count++;
        } else {
            count--;
        }
    }

    return candidate;
}

/**
 * Best time to buy and sell stock for max profit.
 * Track minimum price and calculate potential profit at each step.
 */
function maxProfit(prices: number[]): number {
    let minPrice = Infinity;
    let maxProfit = 0;

    for (const price of prices) {
        if (price < minPrice) {
            minPrice = price; // update lowest
        } else {
            maxProfit = Math.max(maxProfit, price - minPrice); // update best profit
        }
    }

    return maxProfit;
}

/*****************************
 * 5️⃣ Heap / Median from Stream
 *****************************/
/**
 * MaxHeap and MinHeap implementations with comments.
 * Used by MedianFinder (two-heap approach) to maintain the median in O(log n) per insert, O(1) for find.
 */

class MaxHeap {
    private data: number[] = [];

    // Number of elements in the heap
    size(): number { return this.data.length; }

    // Top (maximum) element without removing it
    peek(): number | undefined { return this.data[0]; }

    // Insert value into the max-heap
    push(val: number) {
        const data = this.data;
        // append at the end and bubble up to restore heap property
        data.push(val);
        let idx = data.length - 1;
        const element = val;

        // While not at root and element is greater than parent, shift parent down
        while (idx > 0) {
            const parentIdx = (idx - 1) >> 1; // parent index: floor((idx-1)/2)
            const parent = data[parentIdx];
            if (element <= parent) break;     // correct position found
            data[idx] = parent;               // move parent down
            idx = parentIdx;                  // continue up the tree
        }

        // Place element in its final position (only one write)
        data[idx] = element;
    }

    // Remove and return the max element
    pop(): number | undefined {
        const data = this.data;
        const length = data.length;
        if (length === 0) return undefined;

        const top = data[0];       // value to return
        const last = data.pop()!;  // last element (to be moved to root)
        if (data.length === 0) return top; // heap now empty after pop

        // Move last to root and bubble down to restore heap property
        data[0] = last;
        let idx = 0;
        const element = last;
        const len = data.length;

        while (true) {
            const leftIdx = (idx << 1) + 1; // left child: 2*idx + 1
            if (leftIdx >= len) break;      // no children
            const rightIdx = leftIdx + 1;

            // choose the larger child to swap with
            let swapIdx = leftIdx;
            if (rightIdx < len && data[rightIdx] > data[leftIdx]) swapIdx = rightIdx;

            // if child <= element, heap property satisfied
            if (data[swapIdx] <= element) break;

            // move child up and continue downwards
            data[idx] = data[swapIdx];
            idx = swapIdx;
        }

        // place element in its final position
        data[idx] = element;
        return top;
    }
}

class MinHeap {
    private data: number[] = [];

    // Number of elements in the heap
    size(): number { return this.data.length; }

    // Top (minimum) element without removing it
    peek(): number | undefined { return this.data[0]; }

    // Insert value into the min-heap
    push(val: number) {
        const data = this.data;
        data.push(val);
        let idx = data.length - 1;
        const element = val;

        // While not at root and element is smaller than parent, shift parent down
        while (idx > 0) {
            const parentIdx = (idx - 1) >> 1;
            const parent = data[parentIdx];
            if (element >= parent) break;  // correct position found
            data[idx] = parent;            // move parent down
            idx = parentIdx;
        }

        // Place element in final position
        data[idx] = element;
    }

    // Remove and return the min element
    pop(): number | undefined {
        const data = this.data;
        const length = data.length;
        if (length === 0) return undefined;

        const top = data[0];
        const last = data.pop()!;
        if (data.length === 0) return top;

        data[0] = last;
        let idx = 0;
        const element = last;
        const len = data.length;

        while (true) {
            const leftIdx = (idx << 1) + 1; // left child
            if (leftIdx >= len) break;      // no children
            const rightIdx = leftIdx + 1;

            // choose the smaller child to swap with
            let swapIdx = leftIdx;
            if (rightIdx < len && data[rightIdx] < data[leftIdx]) swapIdx = rightIdx;

            // if child >= element, heap property satisfied
            if (data[swapIdx] >= element) break;

            // move child up and continue bubbling down
            data[idx] = data[swapIdx];
            idx = swapIdx;
        }

        // place element into final position
        data[idx] = element;
        return top;
    }
}

/**
 * MedianFinder uses:
 * - MaxHeap 'small' for the lower half (max at top)
 * - MinHeap 'large' for the upper half (min at top)
 *
 * Invariant:
 *  - small.size() == large.size() OR small.size() == large.size() + 1
 *  - All elements in small <= all elements in large
 */
class MedianFinder {
    private small: MaxHeap;
    private large: MinHeap;

    constructor() {
        this.small = new MaxHeap(); // lower half
        this.large = new MinHeap(); // upper half
    }

    // Add number into data structure
    addNum(num: number): void {
        // Insert into appropriate heap:
        // If small is empty or num <= max of small, it belongs to small (lower half)
        if (this.small.size() === 0 || num <= this.small.peek()!) {
            this.small.push(num);
        } else {
            this.large.push(num);
        }

        // Re-balance so small has at most 1 more element than large
        if (this.small.size() > this.large.size() + 1) {
            // move largest from small to large
            this.large.push(this.small.pop()!);
        } else if (this.large.size() > this.small.size()) {
            // move smallest from large to small
            this.small.push(this.large.pop()!);
        }
    }

    // Return median of current stream
    findMedian(): number {
        // If odd number of elements, small has the extra element
        if (this.small.size() > this.large.size()) {
            return this.small.peek()!;
        } else {
            // even: median is average of tops of both heaps
            return (this.small.peek()! + this.large.peek()!) / 2;
        }
    }
}

/**
 * Usage example:
 * var obj = new MedianFinder()
 * obj.addNum(1)
 * obj.addNum(2)
 * var median = obj.findMedian() // 1.5
 */

/******************************************************
 * Example Usage:
 * 
 * const mf = new MedianFinder();
 * mf.addNum(1);
 * mf.addNum(2);
 * console.log(mf.findMedian()); // 1.5
 * mf.addNum(3);
 * console.log(mf.findMedian()); // 2
 ******************************************************/


function smallestMissingValueSubtree(parents: number[], nums: number[]): number[] {
    const n = parents.length;
    const result = new Array(n).fill(1);

    // Build children adjacency list
    const children: number[][] = Array.from({ length: n }, () => []);
    for (let i = 1; i < n; i++) {
        children[parents[i]].push(i);
    }

    // Find node containing value 1
    let node = nums.indexOf(1);
    if (node === -1) return result; // no "1" in tree -> all are 1

    const seen = new Set<number>();
    let missing = 1;

    function dfs(u: number) {
        if (seen.has(nums[u])) return;
        seen.add(nums[u]);
        for (const v of children[u]) dfs(v);
    }

    // Climb from node (with value 1) up to root
    while (node !== -1) {
        dfs(node); // add all values in this subtree

        // update smallest missing
        while (seen.has(missing)) missing++;

        result[node] = missing;
        node = parents[node];
    }

    return result;
}

// Test basic cases
console.log("Test 1:", smallestMissingValueSubtree([-1,0,0,2], [1,2,3,4])); 
// Expected: [5,1,1,1]

console.log("Test 2:", smallestMissingValueSubtree([-1,0,1,0,3,3], [5,4,6,2,1,3])); 
// Expected: [7,1,1,4,2,1]

console.log("Test 3:", smallestMissingValueSubtree([-1,2,3,0,2,4,1], [2,3,4,5,6,7,8])); 
// Expected: [1,1,1,1,1,1,1]


function gcdSort(nums: number[]): boolean {
    const n = nums.length;
    const sorted = [...nums].sort((a, b) => a - b);
    
    // Early return if already sorted
    if (nums.every((val, i) => val === sorted[i])) return true;
    
    // Ultra-fast Union-Find with path compression and union by rank
    const parent = new Int32Array(n);
    const rank = new Int32Array(n);
    for (let i = 0; i < n; i++) parent[i] = i;
    
    const find = (x: number): number => {
        if (parent[x] !== x) {
            parent[x] = find(parent[x]); // Path compression
        }
        return parent[x];
    };
    
    const union = (x: number, y: number): void => {
        const px = find(x), py = find(y);
        if (px === py) return;
        
        // Union by rank for better performance
        if (rank[px] < rank[py]) {
            parent[px] = py;
        } else if (rank[px] > rank[py]) {
            parent[py] = px;
        } else {
            parent[py] = px;
            rank[px]++;
        }
    };
    
    // Map prime factors to indices - much faster than checking all pairs
    const primeToIndices = new Map<number, number[]>();
    
    // Fast prime factorization for each number
    for (let i = 0; i < n; i++) {
        let num = nums[i];
        const factors = new Set<number>();
        
        // Check factor 2
        if (num % 2 === 0) {
            factors.add(2);
            while (num % 2 === 0) num /= 2;
        }
        
        // Check odd factors up to sqrt
        for (let p = 3; p * p <= num; p += 2) {
            if (num % p === 0) {
                factors.add(p);
                while (num % p === 0) num /= p;
            }
        }
        
        // If num > 1, it's a prime factor
        if (num > 1) factors.add(num);
        
        // Group indices by their prime factors
        for (const prime of factors) {
            if (!primeToIndices.has(prime)) {
                primeToIndices.set(prime, []);
            }
            primeToIndices.get(prime)!.push(i);
        }
    }
    
    // Union indices that share prime factors
    for (const indices of primeToIndices.values()) {
        for (let i = 1; i < indices.length; i++) {
            union(indices[0], indices[i]);
        }
    }
    
    // Group indices by connected component
    const components = new Map<number, number[]>();
    for (let i = 0; i < n; i++) {
        const root = find(i);
        if (!components.has(root)) {
            components.set(root, []);
        }
        components.get(root)!.push(i);
    }
    
    // Check each component: can its values match target positions?
    for (const positions of components.values()) {
        // Get current values and target values for this component
        const currentVals = positions.map(i => nums[i]);
        const targetVals = positions.map(i => sorted[i]);
        
        // Sort both to compare multisets
        currentVals.sort((a, b) => a - b);
        targetVals.sort((a, b) => a - b);
        
        // Must be identical multisets
        for (let i = 0; i < currentVals.length; i++) {
            if (currentVals[i] !== targetVals[i]) {
                return false;
            }
        }
    }
    
    return true;
}


function longestSubsequenceRepeatedK(s: string, k: number): string {
    const n = s.length;

    // 1. Frequency filtering
    const freq: Record<string, number> = {};
    for (const ch of s) {
        freq[ch] = (freq[ch] || 0) + 1;
    }
    const validChars = Object.keys(freq)
        .filter(ch => freq[ch] >= k)
        .sort((a, b) => b.localeCompare(a)); // try larger letters first

    // 2. Check if candidate works
    function canForm(seq: string): boolean {
        const target = seq.repeat(k);
        let i = 0;
        for (const ch of s) {
            if (ch === target[i]) i++;
            if (i === target.length) return true;
        }
        return false;
    }

    let best = "";

    // 3. DFS search for subsequences
    function dfs(path: string) {
        // Pruning: skip if cannot beat current best
        if (path.length > Math.floor(n / k)) return;
        if (path.length > 0 && canForm(path)) {
            if (
                path.length > best.length ||
                (path.length === best.length && path > best)
            ) {
                best = path;
            }
        }
        for (const ch of validChars) {
            dfs(path + ch);
        }
    }

    dfs("");
    return best;
}


function lenLongestFibSubseq(arr: number[]): number {
    const n = arr.length;
    const index = new Map<number, number>();
    for (let i = 0; i < n; i++) {
        index.set(arr[i], i);
    }

    // dp[j][i] = length of longest Fib subseq ending with arr[j], arr[i]
    const dp: number[][] = Array.from({ length: n }, () => new Array(n).fill(2));
    let maxLen = 0;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < i; j++) {
            const prev = arr[i] - arr[j]; // arr[k] we are looking for
            if (prev < arr[j] && index.has(prev)) {
                const k = index.get(prev)!;
                dp[j][i] = dp[k][j] + 1;
                maxLen = Math.max(maxLen, dp[j][i]);
            }
        }
    }

    return maxLen >= 3 ? maxLen : 0;
}


function robotSim(commands: number[], obstacles: number[][]): number {
    // Directions: north, east, south, west
    const dirs = [
        [0, 1],   // north
        [1, 0],   // east
        [0, -1],  // south
        [-1, 0]   // west
    ];
    let d = 0; // starting facing north

    // Store obstacles in a set of strings for fast lookup
    const obs = new Set(obstacles.map(o => `${o[0]},${o[1]}`));

    let x = 0, y = 0;
    let maxDist = 0;

    for (const cmd of commands) {
        if (cmd === -2) {          // turn left
            d = (d + 3) % 4;       // equivalent to -1 mod 4
        } else if (cmd === -1) {   // turn right
            d = (d + 1) % 4;
        } else {                   // move forward step by step
            const [dx, dy] = dirs[d];
            for (let step = 0; step < cmd; step++) {
                const nx = x + dx;
                const ny = y + dy;
                if (obs.has(`${nx},${ny}`)) break; // obstacle ahead
                x = nx;
                y = ny;
                maxDist = Math.max(maxDist, x*x + y*y);
            }
        }
    }

    return maxDist;
}

function longestValidParentheses(s: string): number {
    const stack: number[] = [-1];
    let maxLen = 0;

    for (let i = 0; i < s.length; i++) {
        if (s[i] === '(') {
            stack.push(i);
        } else {
            stack.pop();
            if (stack.length === 0) {
                stack.push(i);
            } else {
                maxLen = Math.max(maxLen, i - stack[stack.length - 1]);
            }
        }
    }
    return maxLen;
};

// Tests
console.log(longestValidParentheses("(()"));      // 2
console.log(longestValidParentheses(")()())"));   // 4
console.log(longestValidParentheses(""));         // 0
console.log(longestValidParentheses("()(())"));   // 6


function findSubstring(s: string, words: string[]): number[] {
    
    const result: number[] = [];
    if (s.length === 0 || words.length === 0) return result;

    const wordLen = words[0].length;
    const totalLen = wordLen * words.length;

    // frequency map for words
    const wordCount: Record<string, number> = {};
    for (const w of words) {
        wordCount[w] = (wordCount[w] || 0) + 1;
    }

    // iterate over each offset in word length
    for (let i = 0; i < wordLen; i++) {
        let left = i;
        let count = 0;
        let currCount: Record<string, number> = {};

        for (let j=i; j + wordLen <= s.length; j += wordLen) {
            const word = s.slice(j, j + wordLen);

            if (wordCount[word] !== undefined) {
                currCount[word] = (currCount[word] || 0) + 1;
                count++;

                while (currCount[word] > wordCount[word]) {
                    const leftWord = s.slice(left, left + wordLen);
                    currCount[leftWord]--;
                    left += wordLen;
                    count--;
                }

                // valid concatenation
                if (count === words.length) result.push(left);
            } else {
                // rest window
                currCount = {};
                count = 0;
                left = j + wordLen;
            }
        }
    }
    return result;
};

console.log(findSubstring("barfoothefoobarman", ["foo","bar"])); // [0,9]
console.log(findSubstring("wordgoodgoodgoodbestword", ["word","good","best","word"])); // []
console.log(findSubstring("barfoofoobarthefoobarman", ["bar","foo","the"])); // [6,9,12]


function isMatch(s: string, p: string): boolean {
    let i = 0, j = 0;
    let starIdx = -1, sTmpIdx = -1;

    while (i < s.length) {
        // Match single char or '?'
        if (j < p.length && (p[j] === '?' || p[j] === s[i])) {
            i++;
            j++;
        }
        else if (j < p.length && p[j] === '*') {
            starIdx = j;
            sTmpIdx = i;
            j++;
        }

        else if (starIdx !== -1) {
            j = starIdx + 1;
            sTmpIdx++;
            i = sTmpIdx;
        }
        else {
            return false;
        }
    }
    while (j < p.length && p[j] === '*') j++;
    
    return j === p.length; 
};

// Tests
console.log(isMatch("aa", "a"));          // false
console.log(isMatch("aa", "*"));          // true
console.log(isMatch("cb", "?a"));         // false
console.log(isMatch("adceb", "*a*b"));    // true
console.log(isMatch("acdcb", "a*c?b"));   // false

function isNumber(s: string): boolean {
    s = s.trim();
    let num = false, dot = false, exp = false;

    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c >= '0' && c <= '9') {
            num = true;
        } else if (c === '.') {
            if (dot || exp) return false;
            dot = true; 
        } else if (c === 'e' || c === 'E') {
            if (!num || exp) return false;
            exp = true;
            num = false; // reset for the exponent part
        } else if (c === '+' || c === '-') {
            if (i !== 0 && s[i - 1] !== 'e' && s[i - 1] !== 'E') return false;
        } else {
            return false;
        }
    }
    return num;
};

// Tests
console.log(isNumber("0"));           // true
console.log(isNumber("e"));           // false
console.log(isNumber("."));           // false
console.log(isNumber("2e10"));        // true
console.log(isNumber("-90E3"));       // true
console.log(isNumber("53.5e93"));     // true
console.log(isNumber("95a54e53"));    // false


function fullJustify(words: string[], maxWidth: number): string[] {
    let res: string[] = [];
    let line: string[] = [];
    let lineLen = 0;

    for (let word of words) {
        // if adding this word would exceed maxWidth, flush the line
        if (lineLen + line.length + word.length > maxWidth) {
            let spaces = maxWidth - lineLen;
            let gaps = line.length - 1;

            if (gaps === 0) {
                // only one word --  justify left
                res.push(line[0] + " ".repeat(spaces));
            } else {
                let spaceEach = Math.floor(spaces / gaps);
                let extra = spaces % gaps;
                let justified = "";

                for (let i = 0; i < gaps; i++) {
                    justified += line[i];
                    justified += " ".repeat(spaceEach + (i < extra ? 1 : 0));
                }
                justified += line[line.length - 1];
                res.push(justified);
            }
            // Reset for new line
            line = [];
            lineLen = 0;
        }
        // add word to current line
        line.push(word);
        lineLen += word.length;
    }
    // Last line -- left justified
    let lastLine = line.join(" ");
    lastLine += " ".repeat(maxWidth - lastLine.length);
    res.push(lastLine);

    return res;
};

// test cases
console.log(fullJustify(["This","is","an","example","of","text","justification."], 16));
console.log(fullJustify(["What","must","be","acknowledgment","shall","be"], 16));
console.log(fullJustify(["Science","is","what","we","understand","well","enough","to","explain","to","a","computer.","Art","is","everything","else","we","do"], 20));

function minWindow(s: string, t: string): string {
    if (t.length > s.length) return "";

    const need: Map<string, number> = new Map();
    for (let ch of t) {
        need.set(ch, (need.get(ch) || 0) + 1);
    }

    let haveCount = 0;
    let needCount = need.size;
    const window: Map<string, number> = new Map();

    let res = [-1, -1];
    let resLen = Infinity;
    let left = 0;

    for (let right = 0; right < s.length; right++) {
        let ch = s[right];
        window.set(ch, (window.get(ch) || 0) + 1);

        if (need.has(ch) && window.get(ch) === need.get(ch)) {
            haveCount++;
        }

        while (haveCount === needCount) {
            // update result
            if ((right - left + 1) < resLen) {
                res = [left, right];
                resLen = right - left + 1;
            }

            let leftChar = s[left];
            window.set(leftChar, window.get(leftChar)! - 1);
            if (need.has(leftChar) && window.get(leftChar)! < need.get(leftChar)!) {
                haveCount--;
            }
            left++;
        }
    }

    let[l, r] = res;
    return resLen === Infinity ? "" : s.substring(l, r + 1);
};

// Tests
console.log(minWindow("AAABBBCCCABC", "ABC"));    // "ABC"
console.log(minWindow("AXYBZC", "ABC"));          // "AXYBZC"
console.log(minWindow("AAAAAA", "AAA"));          // "AAA"
console.log(minWindow("HELLO", "WORLD"));         // ""
console.log(minWindow("XYZ", "Z"));               // "Z"
console.log(minWindow("abcdef", "fa"));           // "abcdef"
console.log(minWindow("BACDGABCDA", "ABCD"));     // "ABCD"
console.log(minWindow("aAbBcC", "abc"));          // ""
console.log(minWindow("ab", "abc"));              // ""
console.log(minWindow("xyz", "xyzabc"));          // ""


function numDistinct(s: string, t: string): number {
    const n = s.length, m = t.length;
    if (m > n) return 0;

    // Quick multiset prune: if some char appears more times in t than in s, impossible.
    const countS = new Map<string, number>();
    for (const ch of s) countS.set(ch, (countS.get(ch) || 0) + 1);
    const countT = new Map<string, number>();
    for (const ch of t) countT.set(ch, (countT.get(ch) || 0) + 1);
    for (const [ch, cntT] of countT) {
        if ((countS.get(ch) || 0) < cntT) return 0;
    }

    // Use a typed array for slight performance/stability (values fit 32-bit per problem).
    const dp = new Array<number>(m + 1).fill(0);
    dp[0] = 1;

    for (let i = 1; i <= n; i++) {
        const si = s[i - 1];
        // iterate j backward to avoid overwriting dp[j-1] for this row
        for (let j = m; j >= 1; j--) {
            if (si === t[j - 1]) {
                dp[j] = dp[j] + dp[j - 1];
            }
        }
    }

    return dp[m];
};

console.log(numDistinct("aaaa", "aa")); // 6 ways to match
console.log(numDistinct("abc", "abc")); // 1 way to match
console.log(numDistinct("abc", "abcd")); // 0 ways to match
console.log(numDistinct("banana", "ban")); // 3 ways to match



class TreeNode {
     val: number
     left: TreeNode | null
     right: TreeNode | null
     constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
         this.val = (val===undefined ? 0 : val)
         this.left = (left===undefined ? null : left)
         this.right = (right===undefined ? null : right)
     }
}
 

function maxPathSum(root: TreeNode | null): number {
    // Global best path sum seen so far.
    let best = Number.NEGATIVE_INFINITY; // +1

    function dfs(node: TreeNode | null): number {
        if (node === null) return 0;              // +1

        // Recursive exploration
        const leftGain = Math.max(dfs(node.left), 0);   // +T(left) +1
        const rightGain = Math.max(dfs(node.right), 0); // +T(right) +1

        // Path through current node
        const priceNewPath = node.val + leftGain + rightGain; // +3

        // Update best
        if (priceNewPath > best) best = priceNewPath;   // +2

        // Return extendable gain
        return node.val + Math.max(leftGain, rightGain); // +3
    }

    dfs(root); // +T(root)
    return best; // +1
}



// helper to print test result
function runAndLog(name: string, root: TreeNode | null) {
  console.log(`${name}:`, maxPathSum(root));
}

// Example 1: [1,2,3] -> 2 -> 1 -> 3 = 6
const ex1 = new TreeNode(1, new TreeNode(2), new TreeNode(3));
runAndLog("ex1 [1,2,3]", ex1); // expected 6

// Example 2: [-10,9,20,null,null,15,7] -> 15 + 20 + 7 = 42
const ex2 = new TreeNode(
  -10,
  new TreeNode(9),
  new TreeNode(20, new TreeNode(15), new TreeNode(7))
);
runAndLog("ex2 [-10,9,20,...]", ex2); // expected 42

// Extra 1: single negative node -> [-3] => -3
const singleNeg = new TreeNode(-3);
runAndLog("singleNeg [-3]", singleNeg); // expected -3

// Extra 2: mix with two positive children => [2, -1, 2] => best: 2 + 2 = 4
const mix = new TreeNode(2, new TreeNode(-1), new TreeNode(2));
runAndLog("mix [2,-1,2]", mix); // expected 4

// Extra 3: skewed left chain: 1 <- 2 <- 3 (as left children)
// path best is sum of all: 3 + 2 + 1 = 6
const skewed = new TreeNode(1, new TreeNode(2, new TreeNode(3), null), null);
runAndLog("skewed left [1,2,null,3]", skewed); // expected 6

// Extra 4: more mixed values for coverage
const tricky = new TreeNode(
  -2,
  new TreeNode(-1),
  new TreeNode(3, new TreeNode(-4), new TreeNode(5))
);
runAndLog("tricky mixed", tricky); // sanity check

// -----------------------------------------------------
// Complexity Summary
// Each node visited once: O(n)
// Per node: O(1) work (adds, max, compare)
// Total: T(n) = O(n)

// -----------------------------------------------------
// Quick test cases (copy/paste friendly):
// Input: [1,2,3]              -> Output: 6
// Input: [-10,9,20,null,null,15,7] -> Output: 42
// Input: [1]                  -> Output: 1
// Input: [-3]                 -> Output: -3
// Input: [2,-1]               -> Output: 2


function findLadders(beginWord: string, endWord: string, wordList: string[]): string[][] {
    const dict = new Set(wordList);
    if (!dict.has(endWord)) return [];

    const parents = new Map<string, string[]>(); // child -> [parents at previous level]
    let queue: string[] = [beginWord];
    const visited = new Set<string>([beginWord]);
    let foundEnd = false;

    while (queue.length && !foundEnd) {
        const nextLevel = new Set<string>();
        const localVisited = new Set<string>();

        for (const word of queue) {
            for (const nei of getNeighbors(word, dict)) {
                if (!visited.has(nei)) {
                    if (!parents.has(nei)) parents.set(nei, []); // <-- FIX (was checking visited)
                    parents.get(nei)!.push(word);                 // collect ALL shortest-level parents
                    localVisited.add(nei);
                    nextLevel.add(nei);
                    if (nei === endWord) foundEnd = true;
                }
            }
        }

        for (const w of localVisited) visited.add(w);
        queue = Array.from(nextLevel);
    }

    if (!foundEnd) return [];

    const res: string[][] = [];
    const path: string[] = [];

    // backtrack from endWord using parents to generate all shortest sequences
    function backtrack(word: string) {
        if (word === beginWord) {
            res.push([beginWord, ...path.slice().reverse()]);
            return;
        }
        for (const p of parents.get(word) || []) {
            path.push(word);
            backtrack(p);
            path.pop();
        }
    }

    backtrack(endWord);
    return res;
}

// generate neighbors that differ by exactly 1 letter
function getNeighbors(word: string, dict: Set<string>): string[] {
    const out: string[] = [];
    const arr = word.split("");
    for (let i = 0; i < arr.length; i++) {
        const old = arr[i];
        for (let c = 97; c <= 122; c++) {
            const ch = String.fromCharCode(c);
            if (ch === old) continue;
            arr[i] = ch;
            const w = arr.join("");
            if (dict.has(w)) out.push(w);
        }
        arr[i] = old;
    }
    return out;
}

// tests
console.log(findLadders("hit", "cog", ["hot","dot","dog","lot","log","cog"]));
// expected: [["hit","hot","dot","dog","cog"],["hit","hot","lot","log","cog"]]

console.log(findLadders("hit", "cog", ["hot","dot","dog","lot","log"]));
// expected: []


/**
 * Definition for a binary tree node.
 * class TreeNode {
 *     val: number
 *     left: TreeNode | null
 *     right: TreeNode | null
 *     constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.left = (left===undefined ? null : left)
 *         this.right = (right===undefined ? null : right)
 *     }
 * }
 */

function preorderTraversal(root: TreeNode | null): number[] {
    // Morris preorder traversal amazing solution
    // time O(n), space O(1)
    const res: number[] = [];
    let curr = root;

    while (curr) {
        if (!curr.left) {
            // no left subtree: visit node and move right
            res.push(curr.val);
            curr = curr.right;
        } else {
            // find predecessor
            let pred = curr.left;
            while (pred.right && pred.right !== curr) pred = pred.right;

            if (!pred.right) {
                // create temporary thread, visit current, go left
                res.push(curr.val);
                pred.right = curr;
                curr = curr.left;
            } else {
                pred.right = null;
                curr = curr.right;
            }
        }
    }
    return res;
};

function postorderTraversal(root: TreeNode | null): number[] {
  if (!root) return [];

  const stack: TreeNode[] = [root];
  const res: number[] = [];

  while (stack.length) {
    const node = stack.pop()!;
    res.push(node.val); // visit root first
    if (node.left) stack.push(node.left);   // left child later
    if (node.right) stack.push(node.right); // right child earlier
  }

  return res.reverse(); // reverse to get Left->Right->Root
}


function finalPositionOfSnake(n: number, commands: string[]): number {
    let row = 0;
    let col = 0;

    // process each command
    for (const cmd of commands) {
        if (cmd === "UP") row -= 1;
        else if (cmd === "DOWN") row += 1;
        else if (cmd === "LEFT") col -= 1;
        else if (cmd === "RIGHT") col += 1;
    }

    return row * n + col;
};

// tests
console.log(finalPositionOfSnake(4, ["RIGHT","RIGHT","DOWN","LEFT"])); // row=1,col=1 -> 1*4+1=5
console.log(finalPositionOfSnake(5, [])); // no moves -> 0


function restoreIpAddresses(s: string): string[] {
    const n = s.length;
    const res: string[] = [];

    // Quick pruning: impossible length
    if ( n < 4 || n > 12) return res;

    // check if its a valid segment
    function isValid(start: number, len: number): boolean {
      // leading zero rule
      if(len > 1 && s[start] === '0') return false; 

      let val = 0;
      for (let i = 0; i < len; i++) {
        val = val * 10 + (s.charCodeAt(start + i) - 48);
      }
      return val <= 255;
    }

    function backtrack(start: number, parts: string[]): void {
      const segmentsLeft = 4 - parts.length;
      const remainingChars = n - start;

      if (remainingChars < segmentsLeft || remainingChars > 3 * segmentsLeft) return;
      
      if (parts.length === 4) {
        if (start === n) res.push(parts.join('.')); // found one
        return;
      }

      for (let len = 1; len <= 3 && start + len <= n; len++) {
        if (!isValid(start, len)) continue;
        parts.push(s.substring(start, start + len));
        backtrack(start + len, parts);
        parts.pop();
      }
    }

    backtrack(0, []);
    return res;
};

// test
console.log(restoreIpAddresses("25525511135")); // ["255.255.11.135","255.255.111.35"]
console.log(restoreIpAddresses("0000"));        // ["0.0.0.0"]
console.log(restoreIpAddresses("101023"));      // ["1.0.10.23","1.0.102.3","10.1.0.23","10.10.2.3","101.0.2.3"]

function sortPeople(names: string[], heights: number[]): string[] {
    const n = names.length

    const people: { name: string; h: number}[] = new Array(n);
    for (let i = 0; i < n; i++) {
      people[i] = {name: names[i], h: heights[i] }; 
    }

    people.sort((a, b) => b.h - a.h);

    //extract sorted names
    const result: string[] = new Array(n);
    for (let i = 0; i < n; i++) {
      result[i] = people[i].name;
    }
    return result;
};

function commonFactors(a: number, b: number): number {
    function gcd(x: number, y: number): number {
        while (y !== 0) {
            [x, y] = [y, x % y];
        }
        return x;
    }

    const g = gcd(a, b);
    let count = 0;

    // count divisor of g
    for (let i = 1; i * i <= g; i++) {
        if (g % i === 0) {
            count++;
            if(i !== g / i){
                count++;
            }
        }
    }
    return count;
};

console.log(commonFactors(7, 13));  // 1 → {1}
console.log(commonFactors(1000, 1000)); // 16 (all divisors of 1000)

type Job = [number /*time*/, number /*money*/];

function maximizeDoorDash(jobs: Job[], totalTime: number): number {
const m = jobs.length; // + 1 const 
if (totalTime <= 0|| m === 0) return 0; // + 2
// dp[t] = max money achievable using time exactly t (or <= t if we look at all dp <= t)
// we use 1D reversed iteration for 0/1 knapsack

const dp = new Array<number>(totalTime + 1).fill(0); // + 3

for (let i = 0; i <m; i++) { // + 3n
  const [time, money] = jobs[i];
  if (time <= 0) { 
    continue;
  }

  for ( let t = totalTime; t >= time; t--) {
    const cand = dp[t - time] + money;
    if (cand > dp[t]) dp[t] = cand;
  }
}

return dp[totalTime];
};


// Youtube Video: https://leetcode.com/problems/maximum-number-of-events-that-can-be-attended-ii/submissions/
