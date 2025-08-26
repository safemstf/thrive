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
