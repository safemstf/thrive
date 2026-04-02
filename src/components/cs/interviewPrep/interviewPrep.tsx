'use client'

import React, { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import {
  Play, RotateCcw, Eye, EyeOff, Timer, Lightbulb, CheckCircle, AlertCircle,
  ChevronRight, TrendingUp, Code2, X
} from "lucide-react";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T = {
  ink: '#1a1208', inkMid: '#3d3525', inkLight: '#78716c',
  cream: '#faf7f2', surface: '#f3efe8',
  border: 'rgba(26,18,8,0.10)', borderMid: 'rgba(26,18,8,0.16)',
  accent: '#2563eb', accentBg: '#eff6ff', accentBorder: 'rgba(37,99,235,0.20)',
  green: '#16a34a', greenBg: '#f0fdf4', greenBorder: 'rgba(22,163,74,0.22)',
  amber: '#b45309', amberBg: '#fffbeb', amberBorder: 'rgba(180,83,9,0.22)',
  red: '#dc2626', redBg: '#fef2f2', redBorder: 'rgba(220,38,38,0.22)',
  purple: '#7c3aed', purpleBg: '#f5f3ff', purpleBorder: 'rgba(124,58,237,0.22)',
  serif: '"DM Serif Display", serif', mono: '"DM Mono", monospace', sans: '"DM Sans", sans-serif',
  shadow: '0 1px 3px rgba(26,18,8,0.08), 0 4px 16px rgba(26,18,8,0.06)',
  radius: '12px', radiusSm: '7px',
};

const fadeIn = keyframes`from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}`;

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
`;

// ─── Types ────────────────────────────────────────────────────────────────────
type Diff = 'easy' | 'medium' | 'hard';
type Cat  = 'arrays' | 'strings' | 'dp' | 'design';

interface TestCase   { args: unknown[]; expected: unknown; label: string; compareMode?: 'sortedGroups'; }
interface TestResult { label: string; passed: boolean; got: unknown; expected: unknown; error?: string; }
interface Problem {
  id: string; title: string; difficulty: Diff; category: Cat; pattern: string;
  description: string; examples: { input: string; output: string; explanation?: string }[];
  constraints: string[]; starterCode: string; entryPoint: string;
  solution: string; testCases: TestCase[];
  hints: [string, string, string]; insight: string;
  complexity: { time: string; space: string }; whyAsked: string;
}

// ─── Problem Bank (Python) ────────────────────────────────────────────────────
const PROBLEMS: Problem[] = [
  // ── HASH MAP ──────────────────────────────────────────
  {
    id: 'two-sum', title: 'Two Sum', difficulty: 'easy', category: 'arrays', pattern: 'Hash Map',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. You may assume exactly one solution exists.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    constraints: ['2 <= len(nums) <= 10^4', 'Exactly one valid answer exists'],
    starterCode: `def two_sum(nums, target):\n    pass`,
    entryPoint: 'two_sum',
    solution: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i`,
    testCases: [
      { args: [[2,7,11,15], 9], expected: [0,1], label: 'Basic' },
      { args: [[3,2,4], 6],     expected: [1,2], label: 'Answer at end' },
      { args: [[3,3], 6],       expected: [0,1], label: 'Duplicates' },
    ],
    hints: [
      'What if you stored each number\'s index in a lookup table as you scanned?',
      'For each number, you need (target - number). A dictionary lets you find that in O(1).',
      'Loop with enumerate. At index i: if (target - nums[i]) is in seen, return [seen[complement], i]. Else store seen[nums[i]] = i.',
    ],
    insight: 'Trade O(n) space for O(n) time. Store what you\'ve seen; check if the complement already exists instead of brute-force pair checking.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    whyAsked: 'The canonical hash-map-for-complement problem. Tests your instinct to trade space for time.',
  },
  // ── STACK ─────────────────────────────────────────────
  {
    id: 'valid-parens', title: 'Valid Parentheses', difficulty: 'easy', category: 'strings', pattern: 'Stack',
    description: 'Given a string containing only \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the string is valid \u2014 brackets must close in the correct order.',
    examples: [
      { input: 's = "()[]{}"', output: 'True' },
      { input: 's = "([)]"',  output: 'False', explanation: 'Interleaved brackets' },
    ],
    constraints: ['1 <= len(s) <= 10^4', 's consists of bracket characters only'],
    starterCode: `def is_valid(s):\n    pass`,
    entryPoint: 'is_valid',
    solution: `def is_valid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c in pairs:
            if not stack or stack[-1] != pairs[c]:
                return False
            stack.pop()
        else:
            stack.append(c)
    return len(stack) == 0`,
    testCases: [
      { args: ['()[]{}'], expected: true,  label: 'All match' },
      { args: ['(]'],     expected: false, label: 'Wrong closing' },
      { args: ['([)]'],   expected: false, label: 'Interleaved' },
      { args: ['{[]}'],   expected: true,  label: 'Nested' },
    ],
    hints: [
      'When you see a closing bracket, you need to know the most recently opened bracket.',
      'A stack naturally tracks "last opened". Push on open, pop on close and verify they match.',
      'Use a dict: {")":"(", "]":"[", "}":"{"}. Push open brackets. For close: pop and check. Return len(stack) == 0.',
    ],
    insight: 'The stack models nesting: the last opened must be the next to close. LIFO maps exactly to the problem\'s constraints.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    whyAsked: 'Classic stack application. Tests whether you recognize LIFO structure in a problem.',
  },
  // ── KADANE'S ──────────────────────────────────────────
  {
    id: 'max-subarray', title: 'Maximum Subarray', difficulty: 'easy', category: 'arrays', pattern: 'Kadane\'s Algorithm',
    description: 'Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has sum 6' },
      { input: 'nums = [-1]', output: '-1' },
    ],
    constraints: ['1 <= len(nums) <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    starterCode: `def max_sub_array(nums):\n    pass`,
    entryPoint: 'max_sub_array',
    solution: `def max_sub_array(nums):
    current_sum = max_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum`,
    testCases: [
      { args: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6,  label: 'Mixed values' },
      { args: [[-1]],                    expected: -1, label: 'Single negative' },
      { args: [[5,4,-1,7,8]],            expected: 23, label: 'Mostly positive' },
    ],
    hints: [
      'Track a running sum. At what point does it make sense to restart from the current element?',
      'If the running sum becomes negative, it hurts future subarrays \u2014 reset to the current element.',
      'current_sum = max(num, current_sum + num). max_sum = max(max_sum, current_sum). One pass.',
    ],
    insight: 'At each position: extending the existing subarray is only better than restarting if current_sum > 0. This greedy decision is always optimal.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    whyAsked: 'Introduces the "reset when negative" greedy insight \u2014 a gateway to DP thinking.',
  },
  // ── LINEAR DP ─────────────────────────────────────────
  {
    id: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'easy', category: 'dp', pattern: 'Linear DP',
    description: 'A staircase has n steps. Each time you can climb 1 or 2 steps. How many distinct ways can you reach the top?',
    examples: [
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1' },
      { input: 'n = 5', output: '8' },
    ],
    constraints: ['1 <= n <= 45'],
    starterCode: `def climb_stairs(n):\n    pass`,
    entryPoint: 'climb_stairs',
    solution: `def climb_stairs(n):
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,
    testCases: [
      { args: [3],  expected: 3,  label: 'n=3' },
      { args: [5],  expected: 8,  label: 'n=5' },
      { args: [10], expected: 89, label: 'n=10' },
    ],
    hints: [
      'To reach step n, you arrived from step n-1 (1-step) or step n-2 (2-step). What does that imply?',
      'ways(n) = ways(n-1) + ways(n-2) \u2014 this is the Fibonacci sequence.',
      'No array needed. Track two variables: a, b = 1, 2. For i in range(3, n+1): a, b = b, a+b. Return b.',
    ],
    insight: 'This IS Fibonacci. Recognizing that f(n) = f(n-1) + f(n-2) collapses the problem. Solve bottom-up with O(1) space.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    whyAsked: 'The simplest DP problem. Tests whether you spot overlapping subproblems and build bottom-up.',
  },
  // ── GREEDY ────────────────────────────────────────────
  {
    id: 'best-time-stock', title: 'Best Time to Buy and Sell Stock', difficulty: 'easy', category: 'arrays', pattern: 'Greedy',
    description: 'Given an array prices where prices[i] is a stock price on day i, return the maximum profit from one buy and one sell. Return 0 if no profit is possible.',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy at 1, sell at 6' },
      { input: 'prices = [7,6,4,3,1]',   output: '0', explanation: 'No profitable transaction' },
    ],
    constraints: ['1 <= len(prices) <= 10^5', '0 <= prices[i] <= 10^4'],
    starterCode: `def max_profit(prices):\n    pass`,
    entryPoint: 'max_profit',
    solution: `def max_profit(prices):
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        min_price = min(min_price, price)
        max_profit = max(max_profit, price - min_price)
    return max_profit`,
    testCases: [
      { args: [[7,1,5,3,6,4]], expected: 5, label: 'Profitable' },
      { args: [[7,6,4,3,1]],   expected: 0, label: 'No profit' },
      { args: [[2,4,1]],       expected: 2, label: 'Early buy' },
    ],
    hints: [
      'The optimal buy is always the minimum price seen before the optimal sell day.',
      'Track the minimum price seen so far. At each price, the best profit if you sold today is price - min_so_far.',
      'min_price = inf, result = 0. For each p: min_price = min(min_price, p); result = max(result, p - min_price).',
    ],
    insight: 'You don\'t need to track all pairs. The optimal buy is always the lowest price before the sell. One greedy scan captures the global optimum.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    whyAsked: 'Tests greedy thinking and the "running minimum" pattern. Gateway to multi-transaction stock problems.',
  },
  // ── SLIDING WINDOW ────────────────────────────────────
  {
    id: 'longest-substring', title: 'Longest Substring Without Repeating Characters', difficulty: 'medium', category: 'strings', pattern: 'Sliding Window',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: '"abc" is the longest unique window' },
      { input: 's = "bbbbb"',    output: '1' },
    ],
    constraints: ['0 <= len(s) <= 5*10^4', 's can include letters, digits, symbols, spaces'],
    starterCode: `def length_of_longest_substring(s):\n    pass`,
    entryPoint: 'length_of_longest_substring',
    solution: `def length_of_longest_substring(s):
    seen = {}
    left = result = 0
    for right, char in enumerate(s):
        if char in seen and seen[char] >= left:
            left = seen[char] + 1
        seen[char] = right
        result = max(result, right - left + 1)
    return result`,
    testCases: [
      { args: ['abcabcbb'], expected: 3, label: 'Repeating' },
      { args: ['bbbbb'],    expected: 1, label: 'All same' },
      { args: ['pwwkew'],   expected: 3, label: '"wke"' },
      { args: [''],         expected: 0, label: 'Empty' },
    ],
    hints: [
      'Maintain a window [left, right] that contains no duplicates. When you see a duplicate, advance the left pointer.',
      'A dict from char to last-seen-index lets you jump the left pointer in O(1) instead of scanning.',
      'seen = {}, left = 0, result = 0. For right, char in enumerate(s): if char in seen and seen[char] >= left, left = seen[char]+1. seen[char] = right. result = max(result, right-left+1).',
    ],
    insight: 'Expand right, contract left only when needed. Storing the last index instead of a boolean lets the left pointer jump.',
    complexity: { time: 'O(n)', space: 'O(min(m,n))' },
    whyAsked: 'The canonical sliding window. Mastering expand-then-contract unlocks dozens of substring/subarray problems.',
  },
  // ── PREFIX/SUFFIX ─────────────────────────────────────
  {
    id: 'product-except-self', title: 'Product of Array Except Self', difficulty: 'medium', category: 'arrays', pattern: 'Prefix & Suffix',
    description: 'Given integer array nums, return array answer where answer[i] = product of all nums except nums[i]. Must run in O(n); no division operator.',
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
      { input: 'nums = [0,1]',     output: '[1,0]' },
    ],
    constraints: ['2 <= len(nums) <= 10^5', 'No division allowed'],
    starterCode: `def product_except_self(nums):\n    pass`,
    entryPoint: 'product_except_self',
    solution: `def product_except_self(nums):
    n = len(nums)
    result = [1] * n
    prefix = 1
    for i in range(n):
        result[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        result[i] *= suffix
        suffix *= nums[i]
    return result`,
    testCases: [
      { args: [[1,2,3,4]], expected: [24,12,8,6], label: 'Standard' },
      { args: [[0,1]],     expected: [1,0],       label: 'Contains zero' },
      { args: [[1,1]],     expected: [1,1],       label: 'All ones' },
    ],
    hints: [
      'answer[i] = (product of everything left of i) * (product of everything right of i).',
      'Make two passes: left-to-right for prefix products, right-to-left for suffix products.',
      'Left pass: result[i] = running prefix. Right pass: multiply result[i] by running suffix. Two loops, O(1) extra space.',
    ],
    insight: 'Decompose each answer into left*right products. Two separate passes avoid division and give O(n) time, O(1) extra space.',
    complexity: { time: 'O(n)', space: 'O(1) (output excluded)' },
    whyAsked: 'Tests prefix/suffix precomputation thinking. The "no division" constraint forces you beyond the naive approach.',
  },
  // ── DP BOTTOM-UP ──────────────────────────────────────
  {
    id: 'coin-change', title: 'Coin Change', difficulty: 'medium', category: 'dp', pattern: 'DP Bottom-Up',
    description: 'Given coin denominations and a target amount, return the minimum number of coins needed. Return -1 if not possible.',
    examples: [
      { input: 'coins = [1,5,11], amount = 15', output: '3', explanation: '5+5+5 = 3 coins' },
      { input: 'coins = [2], amount = 3',        output: '-1' },
    ],
    constraints: ['1 <= len(coins) <= 12', '0 <= amount <= 10^4'],
    starterCode: `def coin_change(coins, amount):\n    pass`,
    entryPoint: 'coin_change',
    solution: `def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if c <= i:
                dp[i] = min(dp[i], dp[i - c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
    testCases: [
      { args: [[1,5,11], 15], expected: 3,  label: 'Multi-denom' },
      { args: [[2], 3],       expected: -1, label: 'Impossible' },
      { args: [[1,2,5], 11],  expected: 3,  label: 'Classic' },
      { args: [[1], 0],       expected: 0,  label: 'Zero amount' },
    ],
    hints: [
      'Define dp[i] = minimum coins to make amount i. What\'s dp[0]? How do you build dp[i] from smaller amounts?',
      'dp[0] = 0. For each i from 1 to amount: try each coin c: if i >= c, dp[i] = min(dp[i], dp[i-c]+1).',
      'dp = [inf] * (amount+1); dp[0] = 0. Nested loop: for i in range(1, amount+1): for c in coins: if c <= i: dp[i] = min(dp[i], dp[i-c]+1). Return dp[amount] if != inf else -1.',
    ],
    insight: 'Classic unbounded knapsack. Build solutions for small amounts; each coin reusable. Recurrence: dp[i] = min(dp[i-c]+1) for all valid coins c.',
    complexity: { time: 'O(amount * len(coins))', space: 'O(amount)' },
    whyAsked: 'Fundamental DP problem. Tests your ability to identify the recurrence and build bottom-up.',
  },
  // ── SORT + MERGE ──────────────────────────────────────
  {
    id: 'merge-intervals', title: 'Merge Intervals', difficulty: 'medium', category: 'arrays', pattern: 'Sort + Merge',
    description: 'Given an array of intervals [start, end], merge all overlapping intervals and return the result.',
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' },
    ],
    constraints: ['1 <= len(intervals) <= 10^4'],
    starterCode: `def merge(intervals):\n    pass`,
    entryPoint: 'merge',
    solution: `def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    result = [intervals[0]]
    for start, end in intervals[1:]:
        if start <= result[-1][1]:
            result[-1][1] = max(result[-1][1], end)
        else:
            result.append([start, end])
    return result`,
    testCases: [
      { args: [[[1,3],[2,6],[8,10],[15,18]]], expected: [[1,6],[8,10],[15,18]], label: 'Multiple overlaps' },
      { args: [[[1,4],[4,5]]],               expected: [[1,5]],                label: 'Touching' },
      { args: [[[1,4],[0,4]]],               expected: [[0,4]],                label: 'One contains other' },
    ],
    hints: [
      'If you sort by start time, overlapping intervals become adjacent.',
      'After sorting, scan: if current interval overlaps with the last merged one, extend it. Otherwise start new.',
      'Sort by start. result = [intervals[0]]. For each [s,e]: if s <= result[-1][1], extend. Else append.',
    ],
    insight: 'Sorting collapses the 2D problem into a 1D scan \u2014 overlapping intervals are adjacent.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    whyAsked: '"Sort first" is a widely applicable pattern. Tests whether sorting transforms complex comparison into simple scan.',
  },
  // ── GREEDY (HORIZON) ──────────────────────────────────
  {
    id: 'jump-game', title: 'Jump Game', difficulty: 'medium', category: 'arrays', pattern: 'Greedy',
    description: 'Given array nums where nums[i] is your max jump from position i, return True if you can reach the last index.',
    examples: [
      { input: 'nums = [2,3,1,1,4]', output: 'True' },
      { input: 'nums = [3,2,1,0,4]', output: 'False', explanation: 'Always land on 0 at index 3' },
    ],
    constraints: ['1 <= len(nums) <= 10^4', '0 <= nums[i] <= 10^5'],
    starterCode: `def can_jump(nums):\n    pass`,
    entryPoint: 'can_jump',
    solution: `def can_jump(nums):
    max_reach = 0
    for i, jump in enumerate(nums):
        if i > max_reach:
            return False
        max_reach = max(max_reach, i + jump)
    return True`,
    testCases: [
      { args: [[2,3,1,1,4]], expected: true,  label: 'Can reach' },
      { args: [[3,2,1,0,4]], expected: false, label: 'Stuck at zero' },
      { args: [[0]],         expected: true,  label: 'Single element' },
    ],
    hints: [
      'Track the furthest index you can currently reach (the frontier).',
      'At each index i: if i > frontier, you can never proceed \u2014 return False.',
      'max_reach = 0. for i, jump in enumerate(nums): if i > max_reach return False; max_reach = max(max_reach, i + jump). return True.',
    ],
    insight: 'Maintain the "horizon" \u2014 the furthest index reachable. Never simulate individual jumps; just track whether i stays within the horizon.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    whyAsked: 'Clean greedy problem. Teaches "horizon tracking" \u2014 broadly applicable for reachability.',
  },
  // ── HASH MAP CANONICAL KEY ────────────────────────────
  {
    id: 'group-anagrams', title: 'Group Anagrams', difficulty: 'medium', category: 'strings', pattern: 'Hash Map + Canonical Key',
    description: 'Given an array of strings strs, group the anagrams together. Return in any order.',
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
    ],
    constraints: ['1 <= len(strs) <= 10^4', 'strs[i] consists of lowercase letters'],
    starterCode: `def group_anagrams(strs):\n    pass`,
    entryPoint: 'group_anagrams',
    solution: `def group_anagrams(strs):
    from collections import defaultdict
    groups = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))
        groups[key].append(s)
    return list(groups.values())`,
    testCases: [
      { args: [["eat","tea","tan","ate","nat","bat"]], expected: [["bat"],["nat","tan"],["ate","eat","tea"]], label: 'Classic', compareMode: 'sortedGroups' },
      { args: [[""]], expected: [[""]], label: 'Empty string' },
      { args: [["a"]], expected: [["a"]], label: 'Single' },
    ],
    hints: [
      'Two strings are anagrams if they contain the same characters with same frequencies. What key captures that?',
      'Sort each string alphabetically \u2014 all anagrams produce the same sorted form. Use it as a dict key.',
      'groups = defaultdict(list). For each s: key = "".join(sorted(s)); groups[key].append(s). Return list(groups.values()).',
    ],
    insight: 'Define a canonical form for the equivalence class (sorted string). All anagrams share it. The dict groups them.',
    complexity: { time: 'O(n * k log k)', space: 'O(n * k)' },
    whyAsked: 'Tests hash map thinking with non-trivial keys. The pattern generalises: group by equivalence \u2192 find canonical representation.',
  },
  // ── GRID DP ───────────────────────────────────────────
  {
    id: 'unique-paths', title: 'Unique Paths', difficulty: 'medium', category: 'dp', pattern: 'Grid DP',
    description: 'A robot at the top-left of an m*n grid can only move right or down. How many unique paths lead to the bottom-right corner?',
    examples: [
      { input: 'm = 3, n = 7', output: '28' },
      { input: 'm = 3, n = 2', output: '3' },
    ],
    constraints: ['1 <= m, n <= 100'],
    starterCode: `def unique_paths(m, n):\n    pass`,
    entryPoint: 'unique_paths',
    solution: `def unique_paths(m, n):
    dp = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            dp[j] += dp[j - 1]
    return dp[-1]`,
    testCases: [
      { args: [3, 7], expected: 28, label: '3x7' },
      { args: [3, 2], expected: 3,  label: '3x2' },
      { args: [1, 1], expected: 1,  label: '1x1' },
    ],
    hints: [
      'Ways to reach cell (i,j) = ways from above + ways from left.',
      'Build a 2D dp table. First row and column are all 1s.',
      'Space optimize: dp = [1] * n. For each row: for j in 1..n-1: dp[j] += dp[j-1]. Return dp[-1].',
    ],
    insight: 'Classic grid DP: every cell depends only on top and left neighbors. The 1D space optimization is worth practising.',
    complexity: { time: 'O(m*n)', space: 'O(n)' },
    whyAsked: 'Introduces 2D DP and grid traversal. Common in matrix/path problems.',
  },
  // ── PREFIX SUM + HASH MAP ─────────────────────────────
  {
    id: 'subarray-sum-k', title: 'Subarray Sum Equals K', difficulty: 'medium', category: 'arrays', pattern: 'Prefix Sum + Hash Map',
    description: 'Given integer array nums and integer k, return the total number of continuous subarrays whose sum equals k.',
    examples: [
      { input: 'nums = [1,1,1], k = 2', output: '2' },
      { input: 'nums = [1,2,3], k = 3', output: '2' },
    ],
    constraints: ['1 <= len(nums) <= 2*10^4', 'Negatives allowed \u2014 sliding window won\'t work'],
    starterCode: `def subarray_sum(nums, k):\n    pass`,
    entryPoint: 'subarray_sum',
    solution: `def subarray_sum(nums, k):
    count = 0
    prefix_sum = 0
    seen = {0: 1}
    for num in nums:
        prefix_sum += num
        count += seen.get(prefix_sum - k, 0)
        seen[prefix_sum] = seen.get(prefix_sum, 0) + 1
    return count`,
    testCases: [
      { args: [[1,1,1], 2],   expected: 2, label: 'Basic' },
      { args: [[1,2,3], 3],   expected: 2, label: 'Two valid' },
      { args: [[-1,-1,1], 0], expected: 1, label: 'Negatives' },
    ],
    hints: [
      'sum(i..j) = prefix[j] - prefix[i-1]. So you need prefix[j] - k = prefix[i-1].',
      'As you build the running prefix sum, count how many times (prefix_sum - k) appeared before.',
      'seen = {0: 1}, prefix = 0, count = 0. For each num: prefix += num; count += seen.get(prefix-k, 0); seen[prefix] = seen.get(prefix, 0)+1.',
    ],
    insight: 'The prefix sum + hash map combo transforms O(n^2) into O(n). Key equation: any subarray sum = current prefix - some earlier prefix. Works with negatives.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    whyAsked: 'One of the most elegant tricks. The prefix-sum-in-a-hash-map pattern recurs constantly.',
  },
  // ── TWO POINTERS ──────────────────────────────────────
  {
    id: 'trapping-rain', title: 'Trapping Rain Water', difficulty: 'hard', category: 'arrays', pattern: 'Two Pointers',
    description: 'Given n non-negative integers representing an elevation map (bar width 1), compute how much water it can trap.',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
      { input: 'height = [4,2,0,3,2,5]',             output: '9' },
    ],
    constraints: ['1 <= len(height) <= 2*10^4', '0 <= height[i] <= 10^5'],
    starterCode: `def trap(height):\n    pass`,
    entryPoint: 'trap',
    solution: `def trap(height):
    left, right = 0, len(height) - 1
    max_left = max_right = water = 0
    while left < right:
        if height[left] < height[right]:
            max_left = max(max_left, height[left])
            water += max_left - height[left]
            left += 1
        else:
            max_right = max(max_right, height[right])
            water += max_right - height[right]
            right -= 1
    return water`,
    testCases: [
      { args: [[0,1,0,2,1,0,1,3,2,1,2,1]], expected: 6, label: 'Classic' },
      { args: [[4,2,0,3,2,5]],             expected: 9, label: 'Large walls' },
      { args: [[3,0,2,0,4]],               expected: 7, label: 'Valley' },
    ],
    hints: [
      'Water at index i = min(max_left, max_right) - height[i]. How to compute both maxima efficiently?',
      'Two pointers: whichever side has the smaller max determines water at that pointer.',
      'left=0, right=n-1, max_l=max_r=water=0. While left<right: if height[left]<height[right]: max_l=max(max_l,height[left]); water+=max_l-height[left]; left+=1. Else mirror.',
    ],
    insight: 'If max_left < max_right, water at left pointer is bounded by max_left regardless of right side \u2014 you can commit without full information.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    whyAsked: 'A hard problem that becomes O(n)/O(1) with one insight. Tests reasoning about what information is necessary at each step.',
  },
  // ── SLIDING WINDOW (EXPAND/CONTRACT) ──────────────────
  {
    id: 'min-window', title: 'Minimum Window Substring', difficulty: 'hard', category: 'strings', pattern: 'Sliding Window (Expand/Contract)',
    description: 'Given strings s and t, return the minimum window in s that contains every character of t. Return "" if no such window exists.',
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
      { input: 's = "a", t = "aa"', output: '""' },
    ],
    constraints: ['1 <= len(s), len(t) <= 10^5'],
    starterCode: `def min_window(s, t):\n    pass`,
    entryPoint: 'min_window',
    solution: `def min_window(s, t):
    from collections import Counter
    need = Counter(t)
    missing = len(t)
    left = start = end = 0
    for right, char in enumerate(s, 1):
        if need[char] > 0:
            missing -= 1
        need[char] -= 1
        if missing == 0:
            while need[s[left]] < 0:
                need[s[left]] += 1
                left += 1
            if not end or right - left <= end - start:
                start, end = left, right
            need[s[left]] += 1
            missing += 1
            left += 1
    return s[start:end]`,
    testCases: [
      { args: ['ADOBECODEBANC', 'ABC'], expected: 'BANC', label: 'Classic' },
      { args: ['a', 'a'],              expected: 'a',    label: 'Single match' },
      { args: ['a', 'aa'],             expected: '',     label: 'Impossible' },
    ],
    hints: [
      'Expand right until all chars of t are covered. Then shrink left to find the minimum window.',
      'Use Counter for what you need. Track "missing" count. When missing == 0, shrink left.',
      'need = Counter(t), missing = len(t). Expand right: if need[char] > 0, missing -= 1. When missing == 0, shrink left while need[s[left]] < 0.',
    ],
    insight: 'Variable-size sliding window: expand to satisfy, contract to optimize. The "missing" counter makes contraction O(1).',
    complexity: { time: 'O(|s|+|t|)', space: 'O(|t|)' },
    whyAsked: 'The most demanding sliding window problem. Nails expand/contract with multiple character constraints.',
  },
  // ════════════════════════════════════════════════════════
  // NEW PATTERN-PAIRED PROBLEMS
  // ════════════════════════════════════════════════════════
  // ── TWO POINTER SQUEEZE (pairs with Trapping Rain Water) ──
  {
    id: 'container-water', title: 'Container With Most Water', difficulty: 'medium', category: 'arrays', pattern: 'Two Pointers',
    description: 'Given n non-negative integers height[i], where each represents a point (i, height[i]), find two lines that together with the x-axis form a container that holds the most water.',
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'Lines at index 1 (h=8) and index 8 (h=7), width=7, area=7*7=49' },
      { input: 'height = [1,1]', output: '1' },
    ],
    constraints: ['2 <= len(height) <= 10^5', '0 <= height[i] <= 10^4'],
    starterCode: `def max_area(height):\n    pass`,
    entryPoint: 'max_area',
    solution: `def max_area(height):
    left, right = 0, len(height) - 1
    result = 0
    while left < right:
        area = min(height[left], height[right]) * (right - left)
        result = max(result, area)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return result`,
    testCases: [
      { args: [[1,8,6,2,5,4,8,3,7]], expected: 49, label: 'Classic' },
      { args: [[1,1]],               expected: 1,  label: 'Minimum' },
      { args: [[4,3,2,1,4]],         expected: 16, label: 'Symmetric' },
    ],
    hints: [
      'Start with the widest container (left=0, right=n-1). What\'s the only direction to improve?',
      'Moving the taller line inward can only reduce width without increasing height. Move the shorter side.',
      'left=0, right=n-1, result=0. While left<right: area = min(h[left],h[right])*(right-left); result=max(result,area); move the shorter side inward.',
    ],
    insight: 'Same two-pointer squeeze as Trapping Rain Water. The shorter side limits the container \u2014 moving it inward is the only way to potentially find a taller line. Moving the taller side can never help.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    whyAsked: 'Simpler version of the two-pointer squeeze pattern. Practice this before Trapping Rain Water to build the intuition.',
  },
  // ── SORT + TWO POINTERS (pairs with Two Sum) ──────────
  {
    id: 'three-sum', title: '3Sum', difficulty: 'medium', category: 'arrays', pattern: 'Sort + Two Pointers',
    description: 'Given an integer array nums, return all triplets [nums[i], nums[j], nums[k]] such that i != j != k and nums[i] + nums[j] + nums[k] == 0. No duplicate triplets.',
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' },
      { input: 'nums = [0,0,0]', output: '[[0,0,0]]' },
    ],
    constraints: ['3 <= len(nums) <= 3000', '-10^5 <= nums[i] <= 10^5'],
    starterCode: `def three_sum(nums):\n    pass`,
    entryPoint: 'three_sum',
    solution: `def three_sum(nums):
    nums.sort()
    result = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total < 0:
                left += 1
            elif total > 0:
                right -= 1
            else:
                result.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                left += 1
                right -= 1
    return result`,
    testCases: [
      { args: [[-1,0,1,2,-1,-4]], expected: [[-1,-1,2],[-1,0,1]], label: 'Classic' },
      { args: [[0,0,0]],          expected: [[0,0,0]],            label: 'All zeros' },
      { args: [[0,1,1]],          expected: [],                   label: 'No solution' },
    ],
    hints: [
      'Sort the array first. Then for each element, the remaining two elements are a Two Sum problem.',
      'Fix nums[i], use two pointers (left, right) on the remaining sorted array to find pairs summing to -nums[i]. Skip duplicates.',
      'Sort. For i in range(n-2): skip if nums[i]==nums[i-1]. left=i+1, right=n-1. While left<right: check total. Skip duplicate lefts/rights after finding a match.',
    ],
    insight: 'Reduce 3Sum to Two Sum by fixing one element. Sorting enables the two-pointer approach AND duplicate skipping. Same complement logic as Two Sum, different technique.',
    complexity: { time: 'O(n^2)', space: 'O(1) (excluding output)' },
    whyAsked: 'Bridges Two Sum (hash map) with the sort+two-pointer approach. Forces you to handle duplicates cleanly.',
  },
  // ── LINEAR DP (pairs with Climbing Stairs) ────────────
  {
    id: 'house-robber', title: 'House Robber', difficulty: 'medium', category: 'dp', pattern: 'Linear DP',
    description: 'You are robbing houses along a street. Each house has money. Adjacent houses have connected alarms \u2014 if two adjacent houses are robbed, the alarm triggers. Return the maximum amount you can rob without triggering alarms.',
    examples: [
      { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 0 (1) + house 2 (3) = 4' },
      { input: 'nums = [2,7,9,3,1]', output: '12', explanation: 'Rob house 0 (2) + house 2 (9) + house 4 (1) = 12' },
    ],
    constraints: ['1 <= len(nums) <= 100', '0 <= nums[i] <= 400'],
    starterCode: `def rob(nums):\n    pass`,
    entryPoint: 'rob',
    solution: `def rob(nums):
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
    prev2, prev1 = 0, 0
    for num in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + num)
    return prev1`,
    testCases: [
      { args: [[1,2,3,1]],   expected: 4,  label: 'Basic' },
      { args: [[2,7,9,3,1]], expected: 12, label: 'Longer' },
      { args: [[2,1,1,2]],   expected: 4,  label: 'Skip middle' },
    ],
    hints: [
      'At each house, you choose: rob it (skip previous) or skip it (keep previous total). Same structure as Climbing Stairs.',
      'dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Compare with Climbing Stairs: f(n) = f(n-1) + f(n-2).',
      'prev2, prev1 = 0, 0. For num in nums: prev2, prev1 = prev1, max(prev1, prev2 + num). Return prev1. Two variables, O(1) space.',
    ],
    insight: 'Same two-variable recurrence as Climbing Stairs, but with a max() decision instead of addition. If you can solve Climbing Stairs, you can solve this.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    whyAsked: 'Pattern twin of Climbing Stairs. Same f(n-1), f(n-2) structure, adds the "take or skip" decision. Practice both back-to-back.',
  },
  // ── SEQUENCE DP (pairs with Coin Change) ──────────────
  {
    id: 'longest-increasing-subsequence', title: 'Longest Increasing Subsequence', difficulty: 'medium', category: 'dp', pattern: 'Sequence DP',
    description: 'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
    examples: [
      { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: '[2,3,7,101]' },
      { input: 'nums = [0,1,0,3,2,3]', output: '4' },
    ],
    constraints: ['1 <= len(nums) <= 2500', '-10^4 <= nums[i] <= 10^4'],
    starterCode: `def length_of_lis(nums):\n    pass`,
    entryPoint: 'length_of_lis',
    solution: `def length_of_lis(nums):
    from bisect import bisect_left
    tails = []
    for num in nums:
        pos = bisect_left(tails, num)
        if pos == len(tails):
            tails.append(num)
        else:
            tails[pos] = num
    return len(tails)`,
    testCases: [
      { args: [[10,9,2,5,3,7,101,18]], expected: 4, label: 'Classic' },
      { args: [[0,1,0,3,2,3]],         expected: 4, label: 'Duplicates' },
      { args: [[7,7,7,7]],             expected: 1, label: 'All same' },
    ],
    hints: [
      'O(n^2) approach: dp[i] = length of LIS ending at index i. dp[i] = max(dp[j]+1) for all j < i where nums[j] < nums[i].',
      'O(n log n) optimization: maintain a "tails" array where tails[k] = smallest tail element for increasing subsequences of length k+1.',
      'tails = []. For each num: use bisect_left to find position. If pos == len(tails), append. Else replace tails[pos] = num. Return len(tails).',
    ],
    insight: 'Like Coin Change, this is bottom-up DP. The O(n log n) patience sorting optimization uses the insight that only the smallest tail matters for each length.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    whyAsked: 'Classic sequence DP with a binary search optimization. Pattern cousin of Coin Change \u2014 both build up optimal solutions from subproblems.',
  },
  // ── MONOTONIC STACK (pairs with Valid Parentheses) ─────
  {
    id: 'daily-temperatures', title: 'Daily Temperatures', difficulty: 'medium', category: 'arrays', pattern: 'Monotonic Stack',
    description: 'Given array temperatures, return an array answer where answer[i] is the number of days you have to wait for a warmer temperature. If no future warmer day, answer[i] = 0.',
    examples: [
      { input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]' },
      { input: 'temperatures = [30,40,50,60]', output: '[1,1,1,0]' },
    ],
    constraints: ['1 <= len(temperatures) <= 10^5', '30 <= temperatures[i] <= 100'],
    starterCode: `def daily_temperatures(temperatures):\n    pass`,
    entryPoint: 'daily_temperatures',
    solution: `def daily_temperatures(temperatures):
    n = len(temperatures)
    result = [0] * n
    stack = []  # indices of unresolved days
    for i, temp in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < temp:
            prev = stack.pop()
            result[prev] = i - prev
        stack.append(i)
    return result`,
    testCases: [
      { args: [[73,74,75,71,69,72,76,73]], expected: [1,1,4,2,1,1,0,0], label: 'Classic' },
      { args: [[30,40,50,60]],             expected: [1,1,1,0],         label: 'Always increasing' },
      { args: [[60,50,40,30]],             expected: [0,0,0,0],         label: 'Always decreasing' },
    ],
    hints: [
      'Same data structure as Valid Parentheses (stack), different use. Instead of matching brackets, you\'re finding the "next greater element."',
      'Push indices onto stack. When you find a warmer day, pop all cooler days from the stack and record the distance.',
      'stack = []. For i, temp in enumerate: while stack and temps[stack[-1]] < temp: prev = stack.pop(); result[prev] = i - prev. Push i.',
    ],
    insight: 'The stack in Valid Parens matches open/close brackets. Here, the same stack matches each day with its next warmer day. Both are "resolve when condition met" patterns.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    whyAsked: 'Pattern twin of Valid Parentheses. Same stack structure, but for "next greater element" instead of bracket matching. Practice both to see the stack skeleton.',
  },
  // ── FIXED SLIDING WINDOW (pairs with Longest Substring) ─
  {
    id: 'permutation-in-string', title: 'Permutation in String', difficulty: 'medium', category: 'strings', pattern: 'Fixed Sliding Window',
    description: 'Given two strings s1 and s2, return True if s2 contains a permutation of s1. In other words, return True if one of s1\'s permutations is a substring of s2.',
    examples: [
      { input: 's1 = "ab", s2 = "eidbaooo"', output: 'True', explanation: '"ba" is a permutation of "ab"' },
      { input: 's1 = "ab", s2 = "eidboaoo"', output: 'False' },
    ],
    constraints: ['1 <= len(s1), len(s2) <= 10^4', 's1 and s2 consist of lowercase English letters'],
    starterCode: `def check_inclusion(s1, s2):\n    pass`,
    entryPoint: 'check_inclusion',
    solution: `def check_inclusion(s1, s2):
    from collections import Counter
    if len(s1) > len(s2):
        return False
    need = Counter(s1)
    window = Counter(s2[:len(s1)])
    if window == need:
        return True
    for i in range(len(s1), len(s2)):
        window[s2[i]] += 1
        old = s2[i - len(s1)]
        window[old] -= 1
        if window[old] == 0:
            del window[old]
        if window == need:
            return True
    return False`,
    testCases: [
      { args: ['ab', 'eidbaooo'], expected: true,  label: 'Contains "ba"' },
      { args: ['ab', 'eidboaoo'], expected: false, label: 'No permutation' },
      { args: ['a', 'a'],         expected: true,  label: 'Single char' },
    ],
    hints: [
      'A permutation has the same character frequencies as the original. Sliding a fixed-size window of len(s1) across s2...',
      'Compare frequency counts of the window with s1. Same approach as Longest Substring, but the window size is fixed at len(s1).',
      'need = Counter(s1). Slide a window of size len(s1): add right char, remove left char, compare Counters. If equal, return True.',
    ],
    insight: 'Simpler variant of the sliding window from Longest Substring and Min Window. Fixed window size means you always add one and remove one. Same frequency-map comparison.',
    complexity: { time: 'O(n)', space: 'O(1) (26 letters max)' },
    whyAsked: 'Pattern sibling of Longest Substring. Fixed-size window is easier \u2014 practice this first, then variable-size windows.',
  },
];

// ─── Pyodide Runner ───────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodideInstance: any = null;
let pyodideLoading = false;
const pyodideQueue: Array<() => void> = [];

async function getPyodide() {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoading) {
    return new Promise<typeof pyodideInstance>((resolve) => {
      pyodideQueue.push(() => resolve(pyodideInstance));
    });
  }
  pyodideLoading = true;
  const { loadPyodide } = await import('pyodide');
  pyodideInstance = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/',
  });
  pyodideLoading = false;
  for (const cb of pyodideQueue) cb();
  pyodideQueue.length = 0;
  return pyodideInstance;
}

function compareResults(got: unknown, expected: unknown, compareMode?: string): boolean {
  if (compareMode === 'sortedGroups') {
    if (!Array.isArray(got) || !Array.isArray(expected)) return false;
    const sortGroup = (arr: unknown[][]) => arr.map(g => [...g].sort()).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    return JSON.stringify(sortGroup(got as unknown[][])) === JSON.stringify(sortGroup(expected as unknown[][]));
  }
  return JSON.stringify(got) === JSON.stringify(expected);
}

async function runPythonCode(code: string, problem: Problem): Promise<TestResult[]> {
  const py = await getPyodide();
  const results: TestResult[] = [];
  for (const tc of problem.testCases) {
    try {
      const argsStr = tc.args.map(a => JSON.stringify(a)).join(', ');
      const script = `
import json
${code}
_r = ${problem.entryPoint}(${argsStr})
json.dumps(_r)
`;
      const raw = py.runPython(script);
      const got = JSON.parse(raw);
      const passed = compareResults(got, tc.expected, tc.compareMode);
      results.push({ label: tc.label, passed, got, expected: tc.expected });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // Extract just the last line of Python error for readability
      const lines = msg.split('\n').filter(Boolean);
      const short = lines[lines.length - 1] || msg;
      results.push({ label: tc.label, passed: false, got: undefined, expected: tc.expected, error: short });
    }
  }
  return results;
}

// ─── Styled Components ────────────────────────────────────────────────────────
const Root = styled.div`
  min-height:100%;background:${T.cream};font-family:${T.sans};color:${T.ink};
  box-sizing:border-box;display:flex;flex-direction:column;
`;
const TopBar = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  padding:1rem 1.5rem;border-bottom:1px solid ${T.border};flex-wrap:wrap;gap:0.75rem;
`;
const Title = styled.h1`font-family:${T.serif};font-size:1.6rem;font-weight:400;margin:0;`;
const StatChips = styled.div`display:flex;align-items:center;gap:0.75rem;`;
const Chip = styled.span<{$color?:string}>`
  font-family:${T.mono};font-size:0.75rem;font-weight:500;padding:0.3rem 0.7rem;
  border-radius:99px;background:${({$color})=>$color||T.surface};border:1px solid ${T.border};color:${T.inkMid};
`;
const Layout = styled.div`
  display:grid;grid-template-columns:260px 1fr;flex:1;overflow:hidden;
  @media(max-width:900px){grid-template-columns:1fr;}
`;
// ── Sidebar ──
const Sidebar = styled.div`
  border-right:1px solid ${T.border};display:flex;flex-direction:column;overflow:hidden;
`;
const FilterBar = styled.div`display:flex;flex-wrap:wrap;gap:0.3rem;padding:0.75rem 0.75rem 0.5rem;border-bottom:1px solid ${T.border};`;
const FilterBtn = styled.button<{$active:boolean}>`
  padding:0.2rem 0.55rem;border-radius:99px;border:1px solid ${({$active})=>$active?T.ink:'transparent'};
  background:${({$active})=>$active?T.ink:T.surface};color:${({$active})=>$active?T.cream:T.inkMid};
  font-size:0.68rem;font-weight:600;cursor:pointer;transition:all 0.15s;
  &:hover{background:${({$active})=>$active?T.ink:T.border};}
`;
const ProbList = styled.div`flex:1;overflow-y:auto;padding:0.35rem;`;
const ProbItem = styled.button<{$active:boolean;$solved:boolean}>`
  display:flex;align-items:center;justify-content:space-between;width:100%;padding:0.5rem 0.65rem;border-radius:${T.radiusSm};
  border:1px solid ${({$active})=>$active?T.borderMid:'transparent'};
  background:${({$active,$solved})=>$active?T.cream:$solved?T.greenBg:'transparent'};
  color:${T.ink};font-family:${T.sans};font-size:0.78rem;text-align:left;cursor:pointer;transition:all 0.12s;
  &:hover{background:${T.cream};}
`;
const DiffDot = styled.span<{$d:Diff}>`
  width:7px;height:7px;border-radius:50%;flex-shrink:0;
  background:${({$d})=>$d==='easy'?T.green:$d==='medium'?T.amber:T.red};
`;
// ── Main Panel ──
const MainPanel = styled.div`display:flex;flex-direction:column;overflow:hidden;`;
const ProbHeader = styled.div`
  padding:1rem 1.5rem 0.75rem;border-bottom:1px solid ${T.border};
  display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;
`;
const ProbTitle = styled.h2`font-family:${T.serif};font-size:1.35rem;font-weight:400;margin:0;`;
const DiffBadge = styled.span<{$d:Diff}>`
  font-size:0.62rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:99px;
  background:${({$d})=>$d==='easy'?T.greenBg:$d==='medium'?T.amberBg:T.redBg};
  color:${({$d})=>$d==='easy'?T.green:$d==='medium'?T.amber:T.red};
  border:1px solid ${({$d})=>$d==='easy'?T.greenBorder:$d==='medium'?T.amberBorder:T.redBorder};
`;
const PatternTag = styled.span`
  padding:0.15rem 0.55rem;border-radius:99px;background:${T.purpleBg};border:1px solid ${T.purpleBorder};
  color:${T.purple};font-size:0.68rem;font-weight:700;font-family:${T.mono};
`;
const SplitPane = styled.div`
  flex:1;display:grid;grid-template-columns:1fr 1fr;overflow:hidden;
  @media(max-width:1100px){grid-template-columns:1fr;grid-template-rows:auto 1fr;}
`;
// ── Description pane ──
const DescPane = styled.div`overflow-y:auto;padding:1rem 1.5rem;border-right:1px solid ${T.border};`;
const Desc = styled.div`font-size:0.84rem;line-height:1.65;color:${T.inkMid};margin-bottom:1rem;`;
const ExBox = styled.div`background:${T.surface};border:1px solid ${T.border};border-radius:${T.radiusSm};padding:0.7rem 0.85rem;font-family:${T.mono};font-size:0.76rem;color:${T.ink};margin-bottom:0.5rem;`;
const ExLabel = styled.span`font-weight:700;color:${T.inkLight};margin-right:0.3rem;font-size:0.68rem;`;
const ConList = styled.ul`margin:0.5rem 0 0;padding-left:1.2rem;`;
const ConItem = styled.li`font-size:0.78rem;color:${T.inkMid};line-height:1.6;font-family:${T.mono};`;
const WhyBox = styled.div`margin-top:1rem;padding:0.7rem 0.85rem;background:${T.amberBg};border:1px solid ${T.amberBorder};border-radius:${T.radiusSm};font-size:0.78rem;color:${T.amber};line-height:1.5;`;
// ── Code pane ──
const CodePane = styled.div`display:flex;flex-direction:column;overflow:hidden;`;
const EditorWrap = styled.div`flex:1;position:relative;overflow:hidden;display:flex;`;
const LineNums = styled.div`
  padding:1rem 0.5rem 1rem 0.75rem;background:#1a1a1a;color:#555;font-family:${T.mono};
  font-size:0.8rem;line-height:1.6;text-align:right;user-select:none;overflow:hidden;min-width:2.5rem;
`;
const codeAreaStyle: React.CSSProperties = {
  flex:1,padding:'1rem 1rem 1rem 0.5rem',background:'#1e1e1e',color:'#000000',
  fontFamily:'DM Mono, monospace',fontSize:'0.8rem',lineHeight:1.6,border:'none',resize:'none' as const,outline:'none',
  boxSizing:'border-box' as const,tabSize:4,
};
const BtnRow = styled.div`display:flex;align-items:center;gap:0.4rem;padding:0.6rem 0.75rem;border-top:1px solid rgba(255,255,255,0.06);background:#1a1a1a;flex-wrap:wrap;`;
const RunBtn = styled.button<{$loading?:boolean}>`
  display:flex;align-items:center;gap:0.35rem;padding:0.5rem 1rem;border-radius:${T.radiusSm};border:none;
  background:${({$loading})=>$loading?T.amber:T.accent};color:white;font-family:${T.sans};font-size:0.78rem;font-weight:700;cursor:pointer;
  transition:all 0.15s;&:hover{opacity:0.9;}&:disabled{opacity:0.5;cursor:default;}
`;
const SmBtn = styled.button<{$color?:string}>`
  display:flex;align-items:center;gap:0.3rem;padding:0.45rem 0.7rem;border-radius:${T.radiusSm};
  border:1px solid rgba(255,255,255,0.1);background:transparent;color:${({$color})=>$color||'#999'};
  font-family:${T.sans};font-size:0.72rem;font-weight:600;cursor:pointer;transition:all 0.15s;
  &:hover{background:rgba(255,255,255,0.05);}&:disabled{opacity:0.4;cursor:default;}
`;
// ── Results area ──
const ResultsArea = styled.div`max-height:200px;overflow-y:auto;padding:0.5rem 0.75rem;background:#111;border-top:1px solid rgba(255,255,255,0.06);`;
const ResultRow = styled.div<{$pass:boolean}>`
  display:flex;align-items:flex-start;gap:0.4rem;padding:0.45rem 0.5rem;border-radius:4px;margin-bottom:0.25rem;
  background:${({$pass})=>$pass?'rgba(22,163,74,0.1)':'rgba(220,38,38,0.1)'};font-size:0.75rem;
`;
const RLabel = styled.span`font-weight:700;color:#ccc;flex-shrink:0;`;
const RDetail = styled.span`color:#888;font-family:${T.mono};font-size:0.72rem;`;
// ── Hints/Solution overlay ──
const HintArea = styled.div`padding:0.5rem 0.75rem;background:#111;border-top:1px solid rgba(255,255,255,0.06);max-height:250px;overflow-y:auto;`;
const HintBox = styled.div<{$level:number}>`
  padding:0.65rem 0.8rem;border-radius:${T.radiusSm};margin-bottom:0.35rem;font-size:0.78rem;line-height:1.5;
  background:${({$level})=>$level===0?'rgba(37,99,235,0.08)':$level===1?'rgba(180,83,9,0.08)':'rgba(124,58,237,0.08)'};
  border:1px solid ${({$level})=>$level===0?'rgba(37,99,235,0.2)':$level===1?'rgba(180,83,9,0.2)':'rgba(124,58,237,0.2)'};
  color:${({$level})=>$level===0?'#93c5fd':$level===1?'#fbbf24':'#c4b5fd'};
`;
const HintMeta = styled.p`font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;margin:0 0 0.25rem;opacity:0.6;`;
const SolBlock = styled.pre`
  padding:0.8rem;background:#0d0d0d;border:1px solid rgba(124,58,237,0.2);border-radius:${T.radiusSm};
  color:#c4b5fd;font-family:${T.mono};font-size:0.78rem;line-height:1.6;overflow-x:auto;margin:0.35rem 0;white-space:pre;
`;
const InsightBox = styled.div`
  padding:0.65rem 0.8rem;background:rgba(22,163,74,0.08);border:1px solid rgba(22,163,74,0.2);
  border-radius:${T.radiusSm};font-size:0.78rem;line-height:1.5;color:#86efac;margin-top:0.35rem;
`;
const ComplexRow = styled.div`display:flex;gap:0.6rem;margin-top:0.35rem;`;
const ComplexChip = styled.span`font-size:0.7rem;font-family:${T.mono};padding:0.15rem 0.5rem;border-radius:99px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#999;`;
const TimerDisplay = styled.div<{$warn:boolean}>`
  font-family:${T.mono};font-size:0.8rem;font-weight:700;padding:0.3rem 0.7rem;border-radius:${T.radiusSm};
  border:1px solid ${({$warn})=>$warn?T.redBorder:T.border};
  background:${({$warn})=>$warn?T.redBg:T.surface};color:${({$warn})=>$warn?T.red:T.inkMid};cursor:pointer;
`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InterviewPrep() {
  const [diffFilter, setDiffFilter] = useState<string>('all');
  const [catFilter,  setCatFilter]  = useState<string>('all');
  const [selected,   setSelected]   = useState<Problem>(PROBLEMS[0]);
  const [code,       setCode]       = useState(PROBLEMS[0].starterCode);
  const [results,    setResults]    = useState<TestResult[] | null>(null);
  const [hintLevel,  setHintLevel]  = useState(-1);
  const [showSol,    setShowSol]    = useState(false);
  const [running,    setRunning]    = useState(false);
  const [pyLoaded,   setPyLoaded]   = useState(false);
  const [solved,     setSolved]     = useState<Set<string>>(new Set());
  const [timerSec,   setTimerSec]   = useState(45 * 60);
  const [timerOn,    setTimerOn]    = useState(false);
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerOn) {
      timerRef.current = setInterval(() => setTimerSec(s => Math.max(0, s - 1)), 1000);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerOn]);

  const selectProblem = (p: Problem) => {
    setSelected(p); setCode(p.starterCode); setResults(null); setHintLevel(-1); setShowSol(false);
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      const r = await runPythonCode(code, selected);
      setResults(r);
      setPyLoaded(true);
      if (r.every(t => t.passed)) setSolved(s => new Set([...s, selected.id]));
    } catch {
      setResults(selected.testCases.map(tc => ({ label: tc.label, passed: false, got: undefined, expected: tc.expected, error: 'Failed to load Python runtime' })));
    }
    setRunning(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 4; });
    }
  };

  const fmt = (n: number) => `${Math.floor(n / 60).toString().padStart(2,'0')}:${(n%60).toString().padStart(2,'0')}`;
  const lineCount = code.split('\n').length;

  const filtered = PROBLEMS.filter(p =>
    (diffFilter === 'all' || p.difficulty === diffFilter) &&
    (catFilter === 'all' || p.category === catFilter)
  );

  // Pattern grouping for sidebar
  const patterns = [...new Set(PROBLEMS.map(p => p.pattern))];
  const patternCounts = patterns.map(pt => ({ pattern: pt, count: filtered.filter(p => p.pattern === pt).length })).filter(p => p.count > 0);

  return (
    <Root>
      <GlobalStyle />
      <TopBar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Title>LeetCode Practice</Title>
          <Chip $color={T.greenBg}>{solved.size}/{PROBLEMS.length} solved</Chip>
        </div>
        <StatChips>
          {!pyLoaded && <Chip>Python: not loaded yet</Chip>}
          {pyLoaded && <Chip $color={T.greenBg}>Python ready</Chip>}
          <TimerDisplay $warn={timerSec < 300} onClick={() => setTimerOn(t => !t)}>
            <Timer size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {fmt(timerSec)} {timerOn ? '(running)' : '(paused)'}
          </TimerDisplay>
        </StatChips>
      </TopBar>

      <Layout>
        {/* Sidebar */}
        <Sidebar>
          <FilterBar>
            {['all','easy','medium','hard'].map(d => (
              <FilterBtn key={d} $active={diffFilter===d} onClick={()=>setDiffFilter(d)}>
                {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
              </FilterBtn>
            ))}
            <span style={{ width: '100%' }} />
            {['all','arrays','strings','dp'].map(c => (
              <FilterBtn key={c} $active={catFilter===c} onClick={()=>setCatFilter(c)}>
                {c === 'all' ? 'All' : c === 'dp' ? 'DP' : c.charAt(0).toUpperCase() + c.slice(1)}
              </FilterBtn>
            ))}
          </FilterBar>
          <ProbList>
            {filtered.map(p => (
              <ProbItem key={p.id} $active={selected.id===p.id} $solved={solved.has(p.id)} onClick={()=>selectProblem(p)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                  <DiffDot $d={p.difficulty} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                </span>
                {solved.has(p.id) && <CheckCircle size={13} color={T.green} />}
              </ProbItem>
            ))}
            {/* Pattern summary */}
            <div style={{ padding: '0.75rem 0.5rem 0.25rem', borderTop: `1px solid ${T.border}`, marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: T.inkLight }}>
                Patterns
              </span>
              {patternCounts.map(({ pattern, count }) => (
                <div key={pattern} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0.2rem', fontSize: '0.72rem', color: T.inkMid }}>
                  <span>{pattern}</span>
                  <span style={{ fontFamily: T.mono, color: T.inkLight }}>{count}</span>
                </div>
              ))}
            </div>
          </ProbList>
        </Sidebar>

        {/* Main */}
        <MainPanel>
          <ProbHeader>
            <ProbTitle>{selected.title}</ProbTitle>
            <DiffBadge $d={selected.difficulty}>{selected.difficulty}</DiffBadge>
            <PatternTag>{selected.pattern}</PatternTag>
          </ProbHeader>

          <SplitPane>
            {/* Left: Description */}
            <DescPane>
              <Desc>{selected.description}</Desc>
              {selected.examples.map((ex, i) => (
                <ExBox key={i}>
                  <div><ExLabel>Input:</ExLabel>{ex.input}</div>
                  <div><ExLabel>Output:</ExLabel>{ex.output}</div>
                  {ex.explanation && <div style={{ marginTop: '0.3rem', color: T.inkLight, fontSize: '0.72rem' }}>{ex.explanation}</div>}
                </ExBox>
              ))}
              <ConList>
                {selected.constraints.map((c, i) => <ConItem key={i}>{c}</ConItem>)}
              </ConList>
              <WhyBox><strong>Why this is asked:</strong> {selected.whyAsked}</WhyBox>
            </DescPane>

            {/* Right: Editor + Results */}
            <CodePane>
              <EditorWrap>
                <LineNums>
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </LineNums>
                <textarea
                  ref={codeRef}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  placeholder={`# Write your Python solution\n${selected.starterCode}`}
                  style={codeAreaStyle}
                />
              </EditorWrap>

              <BtnRow>
                <RunBtn onClick={handleRun} disabled={running} $loading={running}>
                  {running ? (
                    <><Code2 size={13} /> {pyLoaded ? 'Running...' : 'Loading Python...'}</>
                  ) : (
                    <><Play size={13} /> Run Tests</>
                  )}
                </RunBtn>
                <SmBtn onClick={() => setHintLevel(l => Math.min(l + 1, 2))} disabled={hintLevel >= 2} $color={hintLevel >= 0 ? '#fbbf24' : undefined}>
                  <Lightbulb size={12} /> Hint {Math.min(hintLevel + 2, 3)}/3
                </SmBtn>
                <SmBtn onClick={() => setShowSol(s => !s)} $color={showSol ? '#c4b5fd' : undefined}>
                  {showSol ? <EyeOff size={12} /> : <Eye size={12} />} Solution
                </SmBtn>
                <SmBtn onClick={() => { setCode(selected.starterCode); setResults(null); setHintLevel(-1); setShowSol(false); }}>
                  <RotateCcw size={12} /> Reset
                </SmBtn>
              </BtnRow>

              {/* Hints */}
              {hintLevel >= 0 && (
                <HintArea>
                  {selected.hints.slice(0, hintLevel + 1).map((h, i) => (
                    <HintBox key={i} $level={i}>
                      <HintMeta>Hint {i+1}/3 \u2014 {i===0?'Nudge':i===1?'Approach':'Pseudocode'}</HintMeta>
                      {h}
                    </HintBox>
                  ))}
                </HintArea>
              )}

              {/* Solution */}
              {showSol && (
                <HintArea>
                  <HintMeta style={{ color: '#c4b5fd' }}>Full Solution \u2014 {selected.pattern}</HintMeta>
                  <SolBlock>{selected.solution}</SolBlock>
                  <InsightBox><strong>Insight:</strong> {selected.insight}</InsightBox>
                  <ComplexRow>
                    <ComplexChip>Time: {selected.complexity.time}</ComplexChip>
                    <ComplexChip>Space: {selected.complexity.space}</ComplexChip>
                  </ComplexRow>
                </HintArea>
              )}

              {/* Test results */}
              {results && (
                <ResultsArea>
                  {results.map((r, i) => (
                    <ResultRow key={i} $pass={r.passed}>
                      {r.passed ? <CheckCircle size={13} color="#4ade80" /> : <X size={13} color="#f87171" />}
                      <RLabel>{r.label}</RLabel>
                      {r.passed ? (
                        <RDetail>Passed</RDetail>
                      ) : r.error ? (
                        <RDetail style={{ color: '#f87171' }}>{r.error}</RDetail>
                      ) : (
                        <RDetail>Expected {JSON.stringify(r.expected)}, got {JSON.stringify(r.got)}</RDetail>
                      )}
                    </ResultRow>
                  ))}
                </ResultsArea>
              )}
            </CodePane>
          </SplitPane>
        </MainPanel>
      </Layout>
    </Root>
  );
}
