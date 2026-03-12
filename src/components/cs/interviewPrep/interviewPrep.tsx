'use client'

import React, { useState, useCallback, useEffect, useRef } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import {
  Sparkles, ChevronDown, Copy, CheckCircle, AlertCircle,
  BookOpen, Cpu, MessageSquare, HelpCircle, Calendar,
  Target, Users, Zap, ClipboardList, ChevronRight,
  Play, RotateCcw, Eye, EyeOff, Timer, Code2, CheckSquare,
  TrendingUp, Lightbulb, X
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
  shadowMd: '0 4px 12px rgba(26,18,8,0.10), 0 8px 24px rgba(26,18,8,0.06)',
  radius: '12px', radiusSm: '7px',
};

const fadeIn = keyframes`from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; }`;
const pulse  = keyframes`0%,100% { opacity:1; } 50% { opacity:.5; }`;

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
`;

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode   = 'prep' | 'code';
type Round  = 'technical' | 'behavioral' | 'final' | 'vp';
type Diff   = 'easy' | 'medium' | 'hard';
type Cat    = 'arrays' | 'strings' | 'dp' | 'design';

interface TestCase  { args: unknown[]; expected: unknown; label: string; compareMode?: 'sortedGroups'; }
interface TestResult{ label: string; passed: boolean; got: unknown; expected: unknown; error?: string; }
interface Problem {
  id: string; title: string; difficulty: Diff; category: Cat; pattern: string;
  description: string; examples: { input: string; output: string; explanation?: string }[];
  constraints: string[]; starterCode: string; testCases: TestCase[];
  hints: [string, string, string]; insight: string;
  complexity: { time: string; space: string }; whyAsked: string;
}

interface BehavioralQ { question: string; hint: string; why: string; tags: string[]; }
interface SystemDesignQ { question: string; angles: string[]; }
interface TechTopic { topic: string; subtopics: string[]; }
interface AskThem { question: string; why: string; }
interface GamePlan { when: string; tasks: string[]; }
interface PrepKit {
  behavioral: BehavioralQ[]; systemDesign: SystemDesignQ[];
  technical: TechTopic[]; askThem: AskThem[]; gamePlan: GamePlan[];
}

// ─── Problem Bank ─────────────────────────────────────────────────────────────
const PROBLEMS: Problem[] = [
  {
    id: 'two-sum', title: 'Two Sum', difficulty: 'easy', category: 'arrays', pattern: 'Hash Map',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. You may assume exactly one solution exists.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', 'Exactly one valid answer exists'],
    starterCode: `function twoSum(nums, target) {\n  \n}`,
    testCases: [
      { args: [[2,7,11,15], 9], expected: [0,1], label: 'Basic' },
      { args: [[3,2,4], 6],     expected: [1,2], label: 'Answer at end' },
      { args: [[3,3], 6],       expected: [0,1], label: 'Duplicates' },
    ],
    hints: [
      'What if you stored each number\'s index in a lookup table as you scanned?',
      'For each number, you need (target − number). A hash map lets you find that in O(1).',
      'Loop nums. At index i: if (target − nums[i]) is in the map, return [map[target−nums[i]], i]. Else store nums[i] → i.',
    ],
    insight: 'Trade O(n) space for O(n) time. Store what you\'ve seen; check if the complement already exists instead of brute-force pair checking.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    whyAsked: 'The canonical hash-map-for-complement problem. Tests your instinct to trade space for time.',
  },
  {
    id: 'valid-parens', title: 'Valid Parentheses', difficulty: 'easy', category: 'strings', pattern: 'Stack',
    description: 'Given a string containing only \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the string is valid — brackets must close in the correct order.',
    examples: [
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "([)]"',  output: 'false', explanation: 'Interleaved brackets' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁴', 's consists of bracket characters only'],
    starterCode: `function isValid(s) {\n  \n}`,
    testCases: [
      { args: ['()[]{}'], expected: true,  label: 'All match' },
      { args: ['(]'],     expected: false, label: 'Wrong closing' },
      { args: ['([)]'],   expected: false, label: 'Interleaved' },
      { args: ['{[]}'],   expected: true,  label: 'Nested' },
    ],
    hints: [
      'When you see a closing bracket, you need to know the most recently opened bracket.',
      'A stack naturally tracks "last opened". Push on open, pop on close and verify they match.',
      'Map: {")":"(", "]":"[", "}":"{"}. Push open brackets. For close: pop and check match. Return stack is empty.',
    ],
    insight: 'The stack models nesting: the last opened must be the next to close. Last-in, first-out maps exactly to the problem\'s constraints.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    whyAsked: 'Classic stack application. Tests whether you recognize LIFO structure in a problem.',
  },
  {
    id: 'max-subarray', title: 'Maximum Subarray', difficulty: 'easy', category: 'arrays', pattern: 'Kadane\'s Algorithm',
    description: 'Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has sum 6' },
      { input: 'nums = [-1]', output: '-1' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
    starterCode: `function maxSubArray(nums) {\n  \n}`,
    testCases: [
      { args: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6,  label: 'Mixed values' },
      { args: [[-1]],                    expected: -1, label: 'Single negative' },
      { args: [[5,4,-1,7,8]],            expected: 23, label: 'Mostly positive' },
    ],
    hints: [
      'Track a running sum. At what point does it make sense to restart?',
      'If the running sum becomes negative, it hurts future subarrays — reset to the current element.',
      'currentSum = max(num, currentSum + num). maxSum = max(maxSum, currentSum). One pass.',
    ],
    insight: 'At each position: extending the existing subarray is only better than restarting if currentSum > 0. This greedy decision is always optimal.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    whyAsked: 'Introduces the "reset when negative" greedy insight and local-vs-global optimum — a gateway to DP thinking.',
  },
  {
    id: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'easy', category: 'dp', pattern: 'Dynamic Programming',
    description: 'A staircase has n steps. Each time you can climb 1 or 2 steps. How many distinct ways can you reach the top?',
    examples: [
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1' },
      { input: 'n = 5', output: '8' },
    ],
    constraints: ['1 ≤ n ≤ 45'],
    starterCode: `function climbStairs(n) {\n  \n}`,
    testCases: [
      { args: [3],  expected: 3,  label: 'n=3' },
      { args: [5],  expected: 8,  label: 'n=5' },
      { args: [10], expected: 89, label: 'n=10' },
    ],
    hints: [
      'To reach step n, you arrived from step n-1 (1-step) or step n-2 (2-step). What does that imply?',
      'ways(n) = ways(n-1) + ways(n-2) — this is the Fibonacci sequence.',
      'No array needed. Track two variables: let [a, b] = [1, 2]. For i in 3..n: [a, b] = [b, a+b]. Return b.',
    ],
    insight: 'This IS Fibonacci. Recognizing that f(n) = f(n-1) + f(n-2) collapses the problem. Solve bottom-up with O(1) space.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    whyAsked: 'The simplest DP problem. Tests whether you spot overlapping subproblems and build bottom-up instead of recomputing recursively.',
  },
  {
    id: 'best-time-stock', title: 'Best Time to Buy and Sell Stock', difficulty: 'easy', category: 'arrays', pattern: 'Greedy',
    description: 'Given an array prices where prices[i] is a stock price on day i, return the maximum profit from one buy and one sell. Return 0 if no profit is possible.',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy at 1, sell at 6' },
      { input: 'prices = [7,6,4,3,1]',   output: '0', explanation: 'No profitable transaction' },
    ],
    constraints: ['1 ≤ prices.length ≤ 10⁵', '0 ≤ prices[i] ≤ 10⁴'],
    starterCode: `function maxProfit(prices) {\n  \n}`,
    testCases: [
      { args: [[7,1,5,3,6,4]], expected: 5, label: 'Profitable' },
      { args: [[7,6,4,3,1]],   expected: 0, label: 'No profit' },
      { args: [[2,4,1]],       expected: 2, label: 'Early buy' },
    ],
    hints: [
      'The optimal buy is always the minimum price seen before the optimal sell day.',
      'Track the minimum price seen so far. At each price, the best profit if you sold today is price − minSoFar.',
      'minPrice = Infinity, maxProfit = 0. For each p: minPrice = min(minPrice, p); maxProfit = max(maxProfit, p - minPrice).',
    ],
    insight: 'You don\'t need to track all pairs. The optimal buy is always the lowest price before the sell. One greedy scan captures the global optimum.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    whyAsked: 'Tests greedy thinking and the "running minimum" pattern. Gateway to multi-transaction stock problems.',
  },
  {
    id: 'longest-substring', title: 'Longest Substring Without Repeating Characters', difficulty: 'medium', category: 'strings', pattern: 'Sliding Window',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: '"abc" is the longest unique window' },
      { input: 's = "bbbbb"',    output: '1' },
    ],
    constraints: ['0 ≤ s.length ≤ 5×10⁴', 's can include letters, digits, symbols, spaces'],
    starterCode: `function lengthOfLongestSubstring(s) {\n  \n}`,
    testCases: [
      { args: ['abcabcbb'], expected: 3, label: 'Repeating' },
      { args: ['bbbbb'],    expected: 1, label: 'All same' },
      { args: ['pwwkew'],   expected: 3, label: '"wke"' },
      { args: [''],         expected: 0, label: 'Empty' },
    ],
    hints: [
      'Maintain a window [left, right] that contains no duplicates. When you see a duplicate on the right, advance the left.',
      'A hash map from char → last-seen-index lets you jump the left pointer in O(1) instead of scanning.',
      'map = {}, left = 0, max = 0. For each char at right: if map[char] >= left, left = map[char]+1. map[char] = right; max = max(max, right-left+1).',
    ],
    insight: 'Expand right, contract left only when needed. Storing the last index instead of a boolean lets the left pointer jump — avoiding redundant rescans.',
    complexity: { time: 'O(n)', space: 'O(min(m,n))' },
    whyAsked: 'The canonical sliding window. Mastering expand-then-contract unlocks dozens of substring/subarray problems.',
  },
  {
    id: 'product-except-self', title: 'Product of Array Except Self', difficulty: 'medium', category: 'arrays', pattern: 'Prefix & Suffix Products',
    description: 'Given integer array nums, return array answer where answer[i] = product of all nums except nums[i]. Must run in O(n); no division operator.',
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
      { input: 'nums = [0,1]',     output: '[1,0]' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁵', 'No division allowed', 'Answer fits in 32-bit integer'],
    starterCode: `function productExceptSelf(nums) {\n  \n}`,
    testCases: [
      { args: [[1,2,3,4]], expected: [24,12,8,6], label: 'Standard' },
      { args: [[0,1]],     expected: [1,0],       label: 'Contains zero' },
      { args: [[1,1]],     expected: [1,1],        label: 'All ones' },
    ],
    hints: [
      'answer[i] = (product of everything left of i) × (product of everything right of i).',
      'Make two passes: one left-to-right to collect prefix products, one right-to-left for suffix products.',
      'Left pass: result[i] = product of nums[0..i-1]. Right pass (in-place): multiply result[i] by running suffix product from nums[i+1..n-1].',
    ],
    insight: 'Decompose each answer into left×right products. Two separate passes avoid the division operator and give clean O(n) time, O(1) extra space.',
    complexity: { time: 'O(n)', space: 'O(1) (output excluded)' },
    whyAsked: 'Tests prefix/suffix precomputation thinking. The "no division" constraint forces you beyond the naive approach.',
  },
  {
    id: 'coin-change', title: 'Coin Change', difficulty: 'medium', category: 'dp', pattern: 'Dynamic Programming (Bottom-Up)',
    description: 'Given coin denominations and a target amount, return the minimum number of coins needed to make up the amount. Return -1 if it\'s not possible.',
    examples: [
      { input: 'coins = [1,5,11], amount = 15', output: '3', explanation: '5+5+5 = 3 coins' },
      { input: 'coins = [2], amount = 3',        output: '-1' },
    ],
    constraints: ['1 ≤ coins.length ≤ 12', '0 ≤ amount ≤ 10⁴'],
    starterCode: `function coinChange(coins, amount) {\n  \n}`,
    testCases: [
      { args: [[1,5,11], 15], expected: 3,  label: 'Multi-denom' },
      { args: [[2], 3],        expected: -1, label: 'Impossible' },
      { args: [[1,2,5], 11],   expected: 3,  label: 'Classic' },
      { args: [[1], 0],        expected: 0,  label: 'Zero amount' },
    ],
    hints: [
      'Define dp[i] = minimum coins to make amount i. What\'s dp[0]? How do you build dp[i] from smaller amounts?',
      'dp[0] = 0. For each i from 1 to amount: try each coin c: if i >= c, dp[i] = min(dp[i], dp[i-c]+1).',
      'dp = Array(amount+1).fill(Infinity); dp[0]=0. Nested loop: amounts × coins. Return dp[amount]===Infinity ? -1 : dp[amount].',
    ],
    insight: 'Classic unbounded knapsack. Build up solutions for small amounts; each coin can be reused. The recurrence is: dp[i] = min(dp[i-c]+1) for all valid coins c.',
    complexity: { time: 'O(amount × coins.length)', space: 'O(amount)' },
    whyAsked: 'Fundamental DP problem. Tests your ability to identify the recurrence and build bottom-up — foundational for scheduling, allocation, and resource optimization.',
  },
  {
    id: 'merge-intervals', title: 'Merge Intervals', difficulty: 'medium', category: 'arrays', pattern: 'Sort + Merge',
    description: 'Given an array of intervals [start, end], merge all overlapping intervals and return the result.',
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: '[1,3] and [2,6] overlap' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' },
    ],
    constraints: ['1 ≤ intervals.length ≤ 10⁴', 'intervals[i].length == 2'],
    starterCode: `function merge(intervals) {\n  \n}`,
    testCases: [
      { args: [[[1,3],[2,6],[8,10],[15,18]]], expected: [[1,6],[8,10],[15,18]], label: 'Multiple overlaps' },
      { args: [[[1,4],[4,5]]],               expected: [[1,5]],                label: 'Touching' },
      { args: [[[1,4],[0,4]]],               expected: [[0,4]],                label: 'One contains other' },
    ],
    hints: [
      'If you sort by start time, overlapping intervals become adjacent.',
      'After sorting, scan: if the current interval overlaps with the last merged one, extend it. Otherwise start a new one.',
      'Sort by start. result = [intervals[0]]. For each [s,e]: if s <= result.last[1], result.last[1] = max(result.last[1], e). Else result.push([s,e]).',
    ],
    insight: 'Sorting collapses the 2D problem into a 1D scan — overlapping intervals are adjacent, so you only ever compare with the last merged interval.',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    whyAsked: '"Sort first" is a widely applicable pattern. This problem tests whether you see how sorting transforms a complex comparison into a simple scan.',
  },
  {
    id: 'jump-game', title: 'Jump Game', difficulty: 'medium', category: 'arrays', pattern: 'Greedy',
    description: 'Given array nums where nums[i] is your max jump from position i, return true if you can reach the last index.',
    examples: [
      { input: 'nums = [2,3,1,1,4]', output: 'true' },
      { input: 'nums = [3,2,1,0,4]', output: 'false', explanation: 'Always land on 0 at index 3' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁴', '0 ≤ nums[i] ≤ 10⁵'],
    starterCode: `function canJump(nums) {\n  \n}`,
    testCases: [
      { args: [[2,3,1,1,4]], expected: true,  label: 'Can reach' },
      { args: [[3,2,1,0,4]], expected: false, label: 'Stuck at zero' },
      { args: [[0]],          expected: true,  label: 'Single element' },
    ],
    hints: [
      'Track the furthest index you can currently reach (the frontier).',
      'At each index i: if i > frontier, you\'re stuck and can never proceed.',
      'maxReach = 0. for i in 0..n-1: if i > maxReach return false; maxReach = max(maxReach, i + nums[i]). return true.',
    ],
    insight: 'Maintain the "horizon" — the furthest index reachable. You never need to simulate individual jumps; just track whether i stays within the horizon.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    whyAsked: 'Clean greedy problem. Teaches "horizon tracking" — a broadly applicable pattern for reachability problems.',
  },
  {
    id: 'group-anagrams', title: 'Group Anagrams', difficulty: 'medium', category: 'strings', pattern: 'Hash Map with Canonical Key',
    description: 'Given an array of strings strs, group the anagrams together. You may return them in any order.',
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' },
    ],
    constraints: ['1 ≤ strs.length ≤ 10⁴', 'strs[i] consists of lowercase letters'],
    starterCode: `function groupAnagrams(strs) {\n  \n}`,
    testCases: [
      { args: [["eat","tea","tan","ate","nat","bat"]], expected: [["bat"],["nat","tan"],["ate","eat","tea"]], label: 'Classic', compareMode: 'sortedGroups' },
      { args: [[""]], expected: [[""]], label: 'Empty string' },
      { args: [["a"]], expected: [["a"]], label: 'Single' },
    ],
    hints: [
      'Two strings are anagrams if they contain the same characters with the same frequencies. What key captures that?',
      'Sort each string alphabetically — all anagrams produce the same sorted form. Use it as a hash map key.',
      'map = {}. For each str: key = [...str].sort().join(""); (map[key] ||= []).push(str). return Object.values(map).',
    ],
    insight: 'Define a canonical form for the equivalence class (sorted string). All anagrams share it. The hash map groups them in O(n k log k).',
    complexity: { time: 'O(n × k log k)', space: 'O(n × k)' },
    whyAsked: 'Tests hash map thinking with non-trivial keys. The pattern generalises: whenever you need to group by equivalence, find a canonical representation.',
  },
  {
    id: 'unique-paths', title: 'Unique Paths', difficulty: 'medium', category: 'dp', pattern: 'Grid DP',
    description: 'A robot at the top-left of an m×n grid can only move right or down. How many unique paths lead to the bottom-right corner?',
    examples: [
      { input: 'm = 3, n = 7', output: '28' },
      { input: 'm = 3, n = 2', output: '3' },
    ],
    constraints: ['1 ≤ m, n ≤ 100'],
    starterCode: `function uniquePaths(m, n) {\n  \n}`,
    testCases: [
      { args: [3, 7], expected: 28, label: '3×7' },
      { args: [3, 2], expected: 3,  label: '3×2' },
      { args: [1, 1], expected: 1,  label: '1×1' },
    ],
    hints: [
      'Ways to reach cell (i,j) = ways to reach cell above + ways to reach cell to the left.',
      'Build a 2D dp table. First row and column are all 1s (only one route to reach them).',
      'Space optimize: dp = Array(n).fill(1). For each row: for j=1..n-1: dp[j] += dp[j-1]. Return dp[n-1].',
    ],
    insight: 'Classic grid DP: every cell\'s answer depends only on its top and left neighbors. The 1D space optimization is worth practising.',
    complexity: { time: 'O(m×n)', space: 'O(n)' },
    whyAsked: 'Introduces 2D DP and grid traversal with memoization. Common in matrix/path problems.',
  },
  {
    id: 'subarray-sum-k', title: 'Subarray Sum Equals K', difficulty: 'medium', category: 'arrays', pattern: 'Prefix Sum + Hash Map',
    description: 'Given integer array nums and integer k, return the total number of continuous subarrays whose sum equals k. May contain negative numbers.',
    examples: [
      { input: 'nums = [1,1,1], k = 2', output: '2' },
      { input: 'nums = [1,2,3], k = 3', output: '2' },
    ],
    constraints: ['1 ≤ nums.length ≤ 2×10⁴', 'Negatives allowed — sliding window won\'t work'],
    starterCode: `function subarraySum(nums, k) {\n  \n}`,
    testCases: [
      { args: [[1,1,1], 2],   expected: 2, label: 'Basic' },
      { args: [[1,2,3], 3],   expected: 2, label: 'Two valid' },
      { args: [[-1,-1,1], 0], expected: 1, label: 'Negatives' },
    ],
    hints: [
      'sum(i..j) = prefixSum[j] - prefixSum[i-1]. So you need prefixSum[j] - k = prefixSum[i-1].',
      'As you build the running prefix sum, count how many times (prefixSum − k) appeared before.',
      'map = {0:1}, sum = 0, count = 0. For each num: sum += num; count += map[sum-k]||0; map[sum] = (map[sum]||0)+1. return count.',
    ],
    insight: 'The prefix sum + hash map combo transforms O(n²) into O(n). The key equation: any subarray sum = current prefix − some earlier prefix. Works with negatives.',
    complexity: { time: 'O(n)', space: 'O(n)' },
    whyAsked: 'One of the most elegant tricks in interview problems. The prefix-sum-in-a-hash-map pattern recurs constantly.',
  },
  {
    id: 'trapping-rain', title: 'Trapping Rain Water', difficulty: 'hard', category: 'arrays', pattern: 'Two Pointers',
    description: 'Given n non-negative integers representing an elevation map (each bar has width 1), compute how much water it can trap after raining.',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
      { input: 'height = [4,2,0,3,2,5]',             output: '9' },
    ],
    constraints: ['n = height.length; 1 ≤ n ≤ 2×10⁴', '0 ≤ height[i] ≤ 10⁵'],
    starterCode: `function trap(height) {\n  \n}`,
    testCases: [
      { args: [[0,1,0,2,1,0,1,3,2,1,2,1]], expected: 6, label: 'Classic' },
      { args: [[4,2,0,3,2,5]],             expected: 9, label: 'Large walls' },
      { args: [[3,0,2,0,4]],               expected: 7, label: 'Valley' },
    ],
    hints: [
      'Water at index i = min(maxLeft, maxRight) - height[i]. How to compute both maxima efficiently?',
      'Two pointers: whichever side has the smaller max height determines water at that pointer — regardless of the other side.',
      'left=0, right=n-1, maxL=maxR=0, water=0. While left<right: if height[left]<height[right]: maxL=max(maxL,height[left]); water+=maxL-height[left]; left++. Else mirror for right.',
    ],
    insight: 'If maxLeft < maxRight, water at the left pointer is bounded by maxLeft regardless of what\'s on the right — you can commit without full information. That\'s why two pointers works.',
    complexity: { time: 'O(n)', space: 'O(1)' },
    whyAsked: 'A hard problem that becomes O(n)/O(1) with one insight. Tests ability to reason about what information is actually necessary at each step.',
  },
  {
    id: 'min-window', title: 'Minimum Window Substring', difficulty: 'hard', category: 'strings', pattern: 'Sliding Window (Expand/Contract)',
    description: 'Given strings s and t, return the minimum window in s that contains every character of t. Return "" if no such window exists.',
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
      { input: 's = "a", t = "aa"', output: '""' },
    ],
    constraints: ['1 ≤ |s|, |t| ≤ 10⁵', 's and t consist of letters'],
    starterCode: `function minWindow(s, t) {\n  \n}`,
    testCases: [
      { args: ['ADOBECODEBANC', 'ABC'], expected: 'BANC', label: 'Classic' },
      { args: ['a', 'a'],              expected: 'a',    label: 'Single match' },
      { args: ['a', 'aa'],             expected: '',     label: 'Impossible' },
    ],
    hints: [
      'Expand the right pointer until all chars of t are covered. Then shrink the left to find the minimum window.',
      'Use two frequency maps — one for what you need, one for what\'s in the window — and a "formed" counter for satisfied unique chars.',
      'need = freq(t), have = {}, formed = 0, required = Object.keys(need).length, [l, minW] = [0, ""]. Expand right; if char needed and freq matches, formed++. While formed===required: update minW; shrink left.',
    ],
    insight: 'Variable-size sliding window: two phases — expand to satisfy, contract to optimize. The "formed" counter is the critical detail that makes the contraction O(1) per step.',
    complexity: { time: 'O(|s|+|t|)', space: 'O(|t|)' },
    whyAsked: 'The most demanding sliding window problem. Nails the expand/contract pattern with multiple character constraints.',
  },
];

// ─── Prep Kit Library ──────────────────────────────────────────────────────────
const BEHAVIORAL_BANK: BehavioralQ[] = [
  { question: "Walk me through the most technically complex system you've built end-to-end.", hint: "Cover scale, your exact role, key decisions, trade-offs, and a measurable outcome. Use real numbers.", why: "Tests technical depth + ownership. Interviewers want real complexity, not just CRUD.", tags: ['ownership','technical depth'] },
  { question: "Tell me about a time you had to push back on a product decision for technical reasons.", hint: "Show how you framed technical risk in business terms, how you gained buy-in without being adversarial.", why: "Senior engineers influence decisions. Tests communication and courage.", tags: ['influence','leadership'] },
  { question: "Describe a significant technical failure or outage you were responsible for.", hint: "Don't minimize it. Root cause → response → how you communicated → what changed to prevent recurrence.", why: "How you handle failure reveals character. Ownership + learning is a strong signal.", tags: ['ownership','resilience'] },
  { question: "How do you balance shipping fast vs maintaining technical quality?", hint: "Give a concrete example. Avoid 'it depends' without a real decision behind it.", why: "Reveals your philosophy and whether you can hold the tension between velocity and sustainability.", tags: ['technical judgment','leadership'] },
  { question: "Tell me about a time you changed technical direction mid-project. What drove that?", hint: "What new information emerged? How did you make the case? How did you manage the transition?", why: "Tests adaptability and leadership under uncertainty.", tags: ['adaptability','leadership'] },
  { question: "Describe a situation where you had to deliver difficult news to stakeholders.", hint: "Was it a delay? A security issue? Focus on how early you flagged it and what solutions you offered.", why: "Senior engineers own upward communication. Transparency and solution-orientation matter.", tags: ['communication','ownership'] },
  { question: "Tell me about a time you made a major architectural decision with incomplete information.", hint: "What data did you gather? What assumptions did you make explicit? What would you do differently?", why: "Real engineering is always uncertain. Tests your decision-making framework.", tags: ['technical judgment','ambiguity'] },
  { question: "Describe how you've helped a struggling engineer on your team improve.", hint: "What were the gaps? What actions did you take? What was the outcome? Avoid making it sound easy.", why: "Senior engineers grow others, not just themselves.", tags: ['mentorship','leadership'] },
];

const BEHAVIORAL_SENIOR: BehavioralQ[] = [
  { question: "How do you build engineering culture — specifically psychological safety alongside high performance?", hint: "Give real examples: how you handled brilliant-but-toxic people, or created space for concerns.", why: "Culture multiplies or divides engineering output. Leaders own it.", tags: ['culture','leadership'] },
  { question: "Describe your approach to technical strategy and getting cross-company alignment.", hint: "How do you connect engineering roadmap to business goals? How do you communicate trade-offs upward?", why: "Operates at the intersection of engineering and business.", tags: ['strategy','communication'] },
  { question: "Tell me about a time you disagreed with leadership and how you handled it.", hint: "Show you can disagree constructively — and fully commit once a decision is made.", why: "Tests judgment and professionalism. Common at senior+ levels.", tags: ['leadership','judgment'] },
];

function buildSystemDesign(desc: string): SystemDesignQ[] {
  const d = desc.toLowerCase();
  const domain =
    /payment|fintech|banking|wallet/.test(d) ? 'fintech' :
    /health|medical|patient|hipaa/.test(d) ? 'health' :
    /ecommerce|shop|marketplace|checkout/.test(d) ? 'ecommerce' :
    /ai|ml|model|inference|llm/.test(d) ? 'ai' :
    /social|feed|post|media/.test(d) ? 'social' :
    'general';

  const DESIGNS: Record<string, SystemDesignQ[]> = {
    fintech: [
      { question: "Design a payment processing system with strong consistency guarantees at high throughput.", angles: ["Idempotency keys", "Two-phase commit vs saga pattern", "Reconciliation jobs", "PCI-DSS compliance"] },
      { question: "Design a real-time ledger that can serve millions of balance reads per second.", angles: ["CQRS read/write split", "Event sourcing for audit trail", "Caching hot accounts", "Eventual vs strong consistency"] },
      { question: "Design a fraud detection system that scores transactions in under 100ms.", angles: ["Rule engine vs ML model", "Feature store design", "Async post-processing", "False positive tradeoffs"] },
    ],
    health: [
      { question: "Design a HIPAA-compliant patient data platform with real-time clinician access.", angles: ["Encryption at rest/transit", "Audit logging", "Role-based access", "Consent management"] },
      { question: "Design a system for processing medical imaging at scale.", angles: ["Async pipeline", "Storage tiers", "ML inference service", "DICOM handling"] },
    ],
    ecommerce: [
      { question: "Design a product catalog and search system for millions of SKUs.", angles: ["Elasticsearch indexing", "Faceted search", "Caching strategy", "A/B test ranking"] },
      { question: "Design a distributed inventory management system that prevents overselling.", angles: ["Optimistic vs pessimistic locking", "Event-driven stock updates", "Reservation TTLs", "Cart expiry"] },
    ],
    ai: [
      { question: "Design a low-latency ML inference serving platform.", angles: ["Model versioning", "Batching strategy", "GPU resource allocation", "Canary deployments"] },
      { question: "Design a RAG (retrieval-augmented generation) system for enterprise knowledge.", angles: ["Chunking strategy", "Embedding models", "Vector DB choice", "Context window management"] },
    ],
    social: [
      { question: "Design a social media feed that scales to 100M users.", angles: ["Fan-out on write vs read", "Cache warming", "Timeline storage", "Privacy filter"] },
    ],
    general: [
      { question: "Design a URL shortener with analytics.", angles: ["Hash collision handling", "Redirect performance", "Click analytics pipeline", "Expiry & TTL"] },
      { question: "Design a distributed rate limiter for an API gateway.", angles: ["Token bucket vs leaky bucket", "Redis vs in-memory", "Sliding window counters", "Header propagation"] },
      { question: "Design a notification service that delivers at-least-once across email, push, and SMS.", angles: ["Fanout architecture", "Deduplication", "Retry with exponential backoff", "User preference store"] },
    ],
  };
  return (DESIGNS[domain] || DESIGNS.general).slice(0, 3);
}

function buildTechnical(stack: string, desc: string): TechTopic[] {
  const s = (stack + ' ' + desc).toLowerCase();
  const topics: TechTopic[] = [];
  if (/react|vue|angular|next|frontend/.test(s)) topics.push({ topic: 'React / Frontend Fundamentals', subtopics: ['Virtual DOM & reconciliation', 'State management (Redux, Zustand, Context)', 'React 18: concurrent features, Suspense', 'Performance: memo, useMemo, useCallback', 'SSR vs CSR vs SSG trade-offs'] });
  if (/node|express|fastify|nest|backend|api/.test(s)) topics.push({ topic: 'Node.js & API Design', subtopics: ['Event loop & non-blocking I/O', 'REST vs GraphQL vs gRPC', 'Middleware patterns', 'Connection pooling', 'Rate limiting & throttling'] });
  if (/python|django|flask|fastapi/.test(s)) topics.push({ topic: 'Python & Web Frameworks', subtopics: ['Async: asyncio, ASGI vs WSGI', 'ORM: SQLAlchemy / Django ORM', 'Type hints & Pydantic', 'Testing: pytest patterns', 'Packaging & dependency management'] });
  if (/postgres|mysql|sql|database|db/.test(s)) topics.push({ topic: 'Databases & Query Optimization', subtopics: ['EXPLAIN ANALYZE query plans', 'Index types (B-tree, GIN, partial)', 'Transaction isolation levels', 'N+1 query problem', 'Sharding vs partitioning'] });
  if (/aws|gcp|azure|cloud|k8s|kubernetes|docker/.test(s)) topics.push({ topic: 'Cloud & Infrastructure', subtopics: ['Container orchestration fundamentals', 'IAM & least-privilege design', 'Auto-scaling strategies', 'Cost optimization patterns', 'Observability: logs, metrics, traces'] });
  if (/redis|cache|memcache/.test(s)) topics.push({ topic: 'Caching & Data Structures', subtopics: ['Cache invalidation strategies', 'TTL vs event-driven expiry', 'Cache stampede prevention', 'Redis data structures & use cases'] });
  if (topics.length < 3) {
    topics.push({ topic: 'System Design Fundamentals', subtopics: ['CAP theorem & consistency models', 'Load balancing strategies', 'Database indexing & query planning', 'Message queues (Kafka, RabbitMQ)', 'CDN & edge caching'] });
    topics.push({ topic: 'Distributed Systems Patterns', subtopics: ['Saga pattern vs 2PC', 'Circuit breaker & bulkhead', 'Idempotency & exactly-once delivery', 'CQRS & Event Sourcing', 'Leader election & consensus'] });
  }
  return topics.slice(0, 5);
}

function buildAskThem(role: string, round: Round): AskThem[] {
  const base: AskThem[] = [
    { question: "What does success look like in the first 90 days for this role?", why: "Sets expectations and shows you're thinking about impact." },
    { question: "What's the biggest technical challenge the team is facing right now?", why: "Shows curiosity about real problems, not just the job description." },
    { question: "How does engineering influence product direction here?", why: "Reveals how much technical voice there is in the organization." },
    { question: "What's the deployment pipeline look like — how often do you ship?", why: "Good proxy for engineering maturity and velocity." },
    { question: "How do you handle on-call and incident response?", why: "Reveals operational burden and support culture." },
    { question: "What's been the most interesting technical problem the team solved in the last 6 months?", why: "Tells you the quality and nature of work you'd be doing." },
  ];
  if (round === 'vp' || round === 'final') {
    base.push({ question: "What's your vision for the engineering org over the next 2 years?", why: "Strategic question — VP/senior panels love this." });
    base.push({ question: "How do you think about the balance between innovation and stability?", why: "Reveals leadership philosophy and where they are in company maturity." });
  }
  return base;
}

function buildGamePlan(company: string, round: Round, daysUntil: number): GamePlan[] {
  if (daysUntil <= 1) {
    return [
      { when: daysUntil === 0 ? "Today (Hours Before)" : "Tonight", tasks: [
        `Speed-research ${company || 'the company'}: what they do, recent news, Glassdoor, LinkedIn of your interviewer.`,
        "Pick your 3 strongest STAR stories and rehearse them out loud — once is enough.",
        "Sketch a rough answer to 'Why this company?' — make it specific and genuine.",
        "Pick 3 sharp questions to ask from the 'Ask Them' section.",
      ]},
      { when: "Morning of the Interview", tasks: [
        "No new material. Review notes only — 15 minutes max.",
        "Google '[company name] news site:techcrunch.com' — mention something recent.",
        "Deep breaths: confidence reads as competence.",
      ]},
      { when: "During the Interview", tasks: [
        "Pause 2–3 seconds before answering behaviorals — it reads as thoughtful, not slow.",
        "For technical/design: think out loud. Say what you're considering, not just your conclusion.",
        "Ask your questions even if you're nervous — it signals you're evaluating them too.",
      ]},
      { when: "After the Interview", tasks: [
        "Send a follow-up email within 2 hours: thank them, reference one specific thing from the conversation.",
        "Write down what felt hard — that's signal for next time regardless of outcome.",
      ]},
    ];
  }
  return [
    { when: `Days 1–${Math.max(2, Math.round(daysUntil * 0.3))}: Research & Stories`, tasks: [
      `Research ${company || 'the company'} in depth: product, tech blog, recent hires, Glassdoor, Crunchbase.`,
      "Write your top 5 STAR stories with real numbers. For each: situation → your exact action → measurable result.",
      "Practice 2 stories out loud. Record yourself. Reduce filler words.",
    ]},
    { when: `Days ${Math.round(daysUntil * 0.3) + 1}–${Math.round(daysUntil * 0.7)}: Technical Prep`, tasks: [
      "Sketch solutions to the system design questions in this kit — whiteboard or paper.",
      "Review the technical topics flagged in your kit. Depth over breadth.",
      "Refresh rusty fundamentals relevant to your stack.",
      round === 'technical' ? "Practise 3–5 coding problems in the Code Practice tab — focus on patterns, not memorisation." : "Review your architectural decisions and how you'd explain them.",
    ]},
    { when: `Days ${Math.round(daysUntil * 0.7) + 1}–${daysUntil - 1}: Polish & Questions`, tasks: [
      `Run one full mock interview: ${round === 'technical' ? '45 min coding + system design' : '30 min behavioral + 30 min system design'}.`,
      "Finalise your 5 questions to ask. Make them specific to the company.",
      "Write your 'Why this company?' answer — it must be genuine.",
    ]},
    { when: "Day of: Execution", tasks: [
      "No new material. Confidence-review only.",
      "Bring energy — enthusiasm is memorable.",
      "Ask all your questions.",
      "Follow-up email within 2 hours.",
    ]},
  ];
}

function buildPrepKit(company: string, role: string, desc: string, round: Round, stack: string, daysUntil: number): PrepKit {
  const behavioral = [...BEHAVIORAL_BANK];
  if (round === 'vp' || round === 'final') behavioral.push(...BEHAVIORAL_SENIOR);
  return {
    behavioral,
    systemDesign: buildSystemDesign(desc),
    technical: buildTechnical(stack, desc),
    askThem: buildAskThem(role, round),
    gamePlan: buildGamePlan(company, round, daysUntil),
  };
}

// ─── Code runner ───────────────────────────────────────────────────────────────
function compareResults(got: unknown, expected: unknown, mode?: string): boolean {
  if (mode === 'sortedGroups') {
    const g = got as string[][];
    const e = expected as string[][];
    const norm = (arr: string[][]) =>
      arr.map(grp => [...grp].sort()).sort((a, b) => (a[0] || '').localeCompare(b[0] || ''));
    return JSON.stringify(norm(g)) === JSON.stringify(norm(e));
  }
  return JSON.stringify(got) === JSON.stringify(expected);
}

function runCode(code: string, problem: Problem): TestResult[] {
  let fn: (...args: unknown[]) => unknown;
  try {
    // eslint-disable-next-line no-new-func
    fn = new Function('"use strict"; return (' + code + ')')() as (...args: unknown[]) => unknown;
    if (typeof fn !== 'function') throw new Error('Your code must be a function expression.');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return problem.testCases.map(tc => ({ label: tc.label, passed: false, got: undefined, expected: tc.expected, error: msg }));
  }
  return problem.testCases.map(tc => {
    try {
      const got = fn(...tc.args);
      const passed = compareResults(got, tc.expected, tc.compareMode);
      return { label: tc.label, passed, got, expected: tc.expected };
    } catch (e: unknown) {
      return { label: tc.label, passed: false, got: undefined, expected: tc.expected, error: e instanceof Error ? e.message : String(e) };
    }
  });
}

// ─── Styled Components ────────────────────────────────────────────────────────
const Root = styled.div`
  min-height: 100%; padding: 1.5rem 2rem; background: ${T.cream};
  font-family: ${T.sans}; color: ${T.ink}; box-sizing: border-box;
  @media (max-width: 900px) { padding: 1rem; }
`;
const TopBar = styled.div`display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:0.75rem;`;
const Title  = styled.h1`font-family:${T.serif};font-size:1.85rem;font-weight:400;color:${T.ink};margin:0;`;
const Sub    = styled.p`font-size:0.8rem;color:${T.inkLight};margin:0;`;
const ModeToggle = styled.div`display:flex;background:${T.surface};border:1px solid ${T.border};border-radius:${T.radiusSm};padding:3px;gap:2px;`;
const ModeBtn = styled.button<{$active:boolean}>`
  display:flex;align-items:center;gap:0.4rem;padding:0.45rem 0.9rem;border-radius:5px;border:none;cursor:pointer;font-size:0.8rem;font-weight:600;font-family:${T.sans};transition:all 0.2s;
  background:${({$active})=>$active?T.ink:'transparent'};color:${({$active})=>$active?T.cream:T.inkMid};
  &:hover{background:${({$active})=>$active?T.ink:T.border};}
`;
// Setup form
const SetupCard  = styled.div`background:${T.surface};border:1px solid ${T.border};border-radius:${T.radius};padding:2rem;max-width:660px;margin:0 auto;animation:${fadeIn} 0.3s ease;box-shadow:${T.shadow};`;
const FieldGrid  = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:1rem;@media(max-width:600px){grid-template-columns:1fr;}`;
const Field      = styled.div`display:flex;flex-direction:column;gap:0.3rem;`;
const FieldFull  = styled(Field)`grid-column:1/-1;`;
const Label      = styled.label`font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${T.inkLight};`;
const Input      = styled.input`padding:0.6rem 0.75rem;border:1px solid ${T.borderMid};border-radius:${T.radiusSm};background:${T.cream};font-family:${T.sans};font-size:0.85rem;color:${T.ink};outline:none;&:focus{border-color:${T.accent};}`;
const Textarea   = styled.textarea`padding:0.6rem 0.75rem;border:1px solid ${T.borderMid};border-radius:${T.radiusSm};background:${T.cream};font-family:${T.sans};font-size:0.85rem;color:${T.ink};resize:vertical;min-height:68px;outline:none;&:focus{border-color:${T.accent};}`;
const RoundGrid  = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;@media(max-width:480px){grid-template-columns:repeat(2,1fr);}`;
const RoundBtn   = styled.button<{$active:boolean}>`
  padding:0.55rem 0.4rem;border-radius:${T.radiusSm};border:1px solid ${({$active})=>$active?T.ink:'transparent'};
  background:${({$active})=>$active?T.ink:T.cream};color:${({$active})=>$active?T.cream:T.inkMid};
  font-family:${T.sans};font-size:0.78rem;font-weight:600;cursor:pointer;transition:all 0.15s;
`;
const DaysRow    = styled.div`display:flex;align-items:center;gap:0.75rem;`;
const DaysInput  = styled.input`width:60px;padding:0.5rem 0.6rem;border:1px solid ${T.borderMid};border-radius:${T.radiusSm};background:${T.cream};font-family:${T.mono};font-size:0.9rem;text-align:center;color:${T.ink};outline:none;&:focus{border-color:${T.accent};}`;
const GenBtn     = styled.button<{$disabled?:boolean}>`
  width:100%;padding:0.85rem;border-radius:${T.radiusSm};border:none;margin-top:1rem;cursor:pointer;font-family:${T.sans};font-size:0.9rem;font-weight:700;transition:all 0.2s;
  background:${({$disabled})=>$disabled?T.surface:T.ink};color:${({$disabled})=>$disabled?T.inkLight:T.cream};
  &:hover:not([disabled]){background:#2d2414;}
`;
// Kit results
const KitWrap   = styled.div`display:grid;grid-template-columns:220px 1fr;gap:1.5rem;max-width:1100px;@media(max-width:800px){grid-template-columns:1fr;}`;
const SideNav   = styled.div`display:flex;flex-direction:column;gap:0.35rem;position:sticky;top:1rem;height:fit-content;`;
const SideItem  = styled.button<{$active:boolean}>`
  display:flex;align-items:center;gap:0.6rem;padding:0.6rem 0.8rem;border-radius:${T.radiusSm};border:1px solid ${({$active})=>$active?T.borderMid:'transparent'};
  background:${({$active})=>$active?T.cream:'transparent'};color:${({$active})=>$active?T.ink:T.inkMid};
  font-family:${T.sans};font-size:0.8rem;font-weight:600;cursor:pointer;text-align:left;transition:all 0.15s;
  &:hover{background:${T.cream};}
`;
const ContentWrap = styled.div`animation:${fadeIn} 0.25s ease;`;
const SectionTitle = styled.h2`font-family:${T.serif};font-size:1.4rem;font-weight:400;margin:0 0 1rem;`;
// Q cards
const QCard  = styled.div`background:${T.cream};border:1px solid ${T.border};border-radius:${T.radiusSm};overflow:hidden;margin-bottom:0.75rem;`;
const QHead  = styled.button`display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;padding:1rem 1.1rem;width:100%;background:none;border:none;cursor:pointer;text-align:left;`;
const QNum   = styled.span`font-family:${T.mono};font-size:0.7rem;font-weight:700;color:${T.inkLight};margin-right:0.5rem;`;
const QText  = styled.span`font-size:0.88rem;font-weight:600;color:${T.ink};line-height:1.4;`;
const QBody  = styled.div`padding:0 1.1rem 1rem;border-top:1px solid ${T.border};`;
const QHint  = styled.div`margin:0.75rem 0 0.5rem;padding:0.65rem 0.8rem;background:${T.accentBg};border:1px solid ${T.accentBorder};border-radius:${T.radiusSm};font-size:0.8rem;color:${T.accent};line-height:1.5;`;
const QWhy   = styled.div`display:flex;gap:0.4rem;align-items:flex-start;font-size:0.75rem;color:${T.inkLight};line-height:1.5;`;
const TagRow = styled.div`display:flex;gap:0.35rem;flex-wrap:wrap;margin-top:0.5rem;`;
const Tag    = styled.span`padding:0.15rem 0.5rem;border-radius:99px;font-size:0.65rem;font-weight:600;background:${T.surface};border:1px solid ${T.border};color:${T.inkMid};`;
// System design + game plan
const SDCard  = styled.div`border:1px solid ${T.border};border-radius:${T.radiusSm};padding:1rem 1.1rem;margin-bottom:0.75rem;background:${T.cream};`;
const SDQ     = styled.p`font-size:0.88rem;font-weight:600;color:${T.ink};margin:0 0 0.6rem;`;
const AngleList = styled.ul`margin:0;padding-left:1.2rem;`;
const Angle   = styled.li`font-size:0.8rem;color:${T.inkMid};line-height:1.6;`;
const GPBlock = styled.div`margin-bottom:0.85rem;`;
const GPWhen  = styled.p`font-size:0.8rem;font-weight:700;color:${T.accent};text-transform:uppercase;letter-spacing:0.04em;margin:0 0 0.35rem;`;
const GPTask  = styled.p`font-size:0.83rem;color:${T.inkMid};margin:0 0 0.3rem;padding-left:0.9rem;position:relative;&::before{content:"·";position:absolute;left:0;color:${T.inkLight};}`;
const AskCard = styled.div`background:${T.cream};border:1px solid ${T.border};border-radius:${T.radiusSm};padding:0.9rem 1rem;margin-bottom:0.6rem;`;
const AskQ    = styled.p`font-size:0.88rem;font-weight:600;color:${T.ink};margin:0 0 0.3rem;`;
const AskWhy  = styled.p`font-size:0.75rem;color:${T.inkLight};margin:0;`;
// ── Code Practice ──
const CodeLayout   = styled.div`display:grid;grid-template-columns:260px 1fr;gap:1rem;min-height:600px;@media(max-width:900px){grid-template-columns:1fr;}`;
const ProbList     = styled.div`display:flex;flex-direction:column;gap:0.25rem;max-height:75vh;overflow-y:auto;padding-right:0.25rem;`;
const ProbItem     = styled.button<{$active:boolean;$solved:boolean}>`
  display:flex;align-items:center;justify-content:space-between;padding:0.55rem 0.75rem;border-radius:${T.radiusSm};
  border:1px solid ${({$active})=>$active?T.borderMid:'transparent'};
  background:${({$active,$solved})=>$active?T.cream:$solved?T.greenBg:'transparent'};
  color:${T.ink};font-family:${T.sans};font-size:0.8rem;text-align:left;cursor:pointer;transition:all 0.15s;
  &:hover{background:${T.cream};}
`;
const DiffBadge = styled.span<{$d:Diff}>`
  font-size:0.62rem;font-weight:700;padding:0.12rem 0.45rem;border-radius:99px;flex-shrink:0;
  background:${({$d})=>$d==='easy'?T.greenBg:$d==='medium'?T.amberBg:T.redBg};
  color:${({$d})=>$d==='easy'?T.green:$d==='medium'?T.amber:T.red};
  border:1px solid ${({$d})=>$d==='easy'?T.greenBorder:$d==='medium'?T.amberBorder:T.redBorder};
`;
const FilterBar = styled.div`display:flex;flex-wrap:wrap;gap:0.35rem;margin-bottom:0.75rem;`;
const FilterBtn = styled.button<{$active:boolean}>`
  padding:0.25rem 0.65rem;border-radius:99px;border:1px solid ${({$active})=>$active?T.ink:'transparent'};
  background:${({$active})=>$active?T.ink:T.surface};color:${({$active})=>$active?T.cream:T.inkMid};
  font-size:0.7rem;font-weight:600;cursor:pointer;transition:all 0.15s;&:hover{background:${({$active})=>$active?T.ink:T.border};}
`;
const ProbPanel    = styled.div`display:flex;flex-direction:column;gap:0.75rem;`;
const ProbHeader   = styled.div`display:flex;align-items:flex-start;gap:0.75rem;flex-wrap:wrap;`;
const ProbTitle    = styled.h2`font-family:${T.serif};font-size:1.5rem;font-weight:400;margin:0;`;
const PatternTag   = styled.span`padding:0.25rem 0.7rem;border-radius:99px;background:${T.purpleBg};border:1px solid ${T.purpleBorder};color:${T.purple};font-size:0.72rem;font-weight:700;font-family:${T.mono};`;
const DescBox      = styled.div`background:${T.surface};border:1px solid ${T.border};border-radius:${T.radiusSm};padding:1rem 1.1rem;font-size:0.84rem;line-height:1.6;color:${T.inkMid};`;
const ExBox        = styled.div`background:${T.cream};border:1px solid ${T.border};border-radius:${T.radiusSm};padding:0.75rem 0.9rem;font-family:${T.mono};font-size:0.78rem;color:${T.ink};margin-top:0.5rem;`;
const ExLabel      = styled.span`font-weight:700;color:${T.inkLight};margin-right:0.35rem;font-size:0.7rem;`;
const CodeEditor   = styled.textarea`
  width:100%;min-height:220px;padding:1rem;border-radius:${T.radiusSm};border:1px solid ${T.borderMid};
  background:#1e1e1e;color:#d4d4d4;font-family:${T.mono};font-size:0.85rem;line-height:1.6;
  resize:vertical;outline:none;box-sizing:border-box;
  &:focus{border-color:${T.accent};}
  &::selection{background:${T.accent}33;}
`;
const BtnRow       = styled.div`display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;`;
const RunBtn       = styled.button`display:flex;align-items:center;gap:0.4rem;padding:0.6rem 1.1rem;border-radius:${T.radiusSm};border:none;background:${T.accent};color:white;font-family:${T.sans};font-size:0.82rem;font-weight:700;cursor:pointer;transition:all 0.15s;&:hover{background:#1d4ed8;}`;
const HintBtn      = styled.button<{$used:boolean}>`display:flex;align-items:center;gap:0.4rem;padding:0.55rem 0.9rem;border-radius:${T.radiusSm};border:1px solid ${T.borderMid};background:${T.cream};color:${({$used})=>$used?T.amber:T.inkMid};font-family:${T.sans};font-size:0.8rem;font-weight:600;cursor:pointer;transition:all 0.15s;&:hover{background:${T.surface};}`;
const SolBtn       = styled.button`display:flex;align-items:center;gap:0.4rem;padding:0.55rem 0.9rem;border-radius:${T.radiusSm};border:1px solid ${T.redBorder};background:${T.redBg};color:${T.red};font-family:${T.sans};font-size:0.8rem;font-weight:600;cursor:pointer;transition:all 0.15s;&:hover{opacity:0.85;}`;
const ResetBtn     = styled.button`display:flex;align-items:center;gap:0.4rem;padding:0.55rem 0.9rem;border-radius:${T.radiusSm};border:1px solid ${T.border};background:transparent;color:${T.inkMid};font-family:${T.sans};font-size:0.8rem;font-weight:600;cursor:pointer;transition:all 0.15s;&:hover{background:${T.surface};}`;
const HintBox      = styled.div<{$level:number}>`padding:0.75rem 0.9rem;border-radius:${T.radiusSm};font-size:0.82rem;line-height:1.5;
  background:${({$level})=>$level===0?T.accentBg:$level===1?T.amberBg:T.purpleBg};
  border:1px solid ${({$level})=>$level===0?T.accentBorder:$level===1?T.amberBorder:T.purpleBorder};
  color:${({$level})=>$level===0?T.accent:$level===1?T.amber:T.purple};
`;
const HintMeta    = styled.p`font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;margin:0 0 0.3rem;opacity:0.7;`;
const Results      = styled.div`display:flex;flex-direction:column;gap:0.4rem;`;
const ResultRow    = styled.div<{$pass:boolean}>`display:flex;align-items:flex-start;gap:0.5rem;padding:0.6rem 0.75rem;border-radius:${T.radiusSm};border:1px solid ${({$pass})=>$pass?T.greenBorder:T.redBorder};background:${({$pass})=>$pass?T.greenBg:T.redBg};font-size:0.78rem;`;
const ResultLabel  = styled.span`font-weight:700;color:${T.ink};flex-shrink:0;`;
const ResultDetail = styled.span`color:${T.inkMid};font-family:${T.mono};font-size:0.75rem;`;
const InsightBox   = styled.div`padding:0.85rem 1rem;background:${T.greenBg};border:1px solid ${T.greenBorder};border-radius:${T.radiusSm};font-size:0.83rem;line-height:1.55;color:${T.green};`;
const ComplexRow   = styled.div`display:flex;gap:1rem;flex-wrap:wrap;`;
const ComplexChip  = styled.span`font-size:0.72rem;font-weight:700;font-family:${T.mono};padding:0.2rem 0.6rem;border-radius:99px;background:${T.surface};border:1px solid ${T.border};color:${T.inkMid};`;
const WhyBox       = styled.div`padding:0.75rem 0.9rem;background:${T.amberBg};border:1px solid ${T.amberBorder};border-radius:${T.radiusSm};font-size:0.8rem;color:${T.amber};line-height:1.5;`;
const TimerDisplay = styled.div<{$warn:boolean}>`font-family:${T.mono};font-size:0.85rem;font-weight:700;padding:0.35rem 0.75rem;border-radius:${T.radiusSm};border:1px solid ${({$warn})=>$warn?T.redBorder:T.border};background:${({$warn})=>$warn?T.redBg:T.surface};color:${({$warn})=>$warn?T.red:T.inkMid};`;

type KitSection = 'gameplan' | 'behavioral' | 'systemdesign' | 'technical' | 'askthem';

// ─── Collapsible Q Card ───────────────────────────────────────────────────────
function BehavQ({ q, idx }: { q: BehavioralQ; idx: number }) {
  const [open, setOpen] = useState(false);
  return (
    <QCard>
      <QHead onClick={() => setOpen(o => !o)}>
        <span><QNum>{String(idx + 1).padStart(2, '0')}</QNum><QText>{q.question}</QText></span>
        <ChevronDown size={15} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s', color: T.inkLight, marginTop: 3 }} />
      </QHead>
      {open && (
        <QBody>
          <QHint><Lightbulb size={13} style={{ flexShrink: 0, marginTop: 2 }} />&nbsp;{q.hint}</QHint>
          <QWhy><AlertCircle size={12} style={{ flexShrink: 0, marginTop: 2 }} />{q.why}</QWhy>
          <TagRow>{q.tags.map(t => <Tag key={t}>{t}</Tag>)}</TagRow>
        </QBody>
      )}
    </QCard>
  );
}

// ─── Code Practice Panel ──────────────────────────────────────────────────────
function CodePractice() {
  const [diffFilter, setDiffFilter] = useState<string>('all');
  const [catFilter,  setCatFilter]  = useState<string>('all');
  const [selected,   setSelected]   = useState<Problem>(PROBLEMS[0]);
  const [code,       setCode]       = useState(PROBLEMS[0].starterCode);
  const [results,    setResults]    = useState<TestResult[] | null>(null);
  const [hintLevel,  setHintLevel]  = useState(-1);
  const [showSol,    setShowSol]    = useState(false);
  const [runs,       setRuns]       = useState(0);
  const [solved,     setSolved]     = useState<Set<string>>(new Set());
  const [timerSec,   setTimerSec]   = useState(45 * 60);
  const [timerOn,    setTimerOn]    = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerOn) {
      timerRef.current = setInterval(() => setTimerSec(s => Math.max(0, s - 1)), 1000);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerOn]);

  const selectProblem = (p: Problem) => {
    setSelected(p); setCode(p.starterCode); setResults(null); setHintLevel(-1); setShowSol(false); setRuns(0);
  };

  const handleRun = () => {
    const r = runCode(code, selected);
    setResults(r);
    setRuns(n => n + 1);
    if (r.every(t => t.passed)) setSolved(s => new Set([...s, selected.id]));
  };

  const handleHint = () => setHintLevel(l => Math.min(l + 1, 2));

  const fmt = (n: number) => `${Math.floor(n / 60).toString().padStart(2,'0')}:${(n%60).toString().padStart(2,'0')}`;

  const filtered = PROBLEMS.filter(p =>
    (diffFilter === 'all' || p.difficulty === diffFilter) &&
    (catFilter === 'all' || p.category === catFilter)
  );

  const allPassed = results !== null && results.every(r => r.passed);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: T.inkLight }}>
            {solved.size}/{PROBLEMS.length} solved · Write JavaScript · Run against test cases
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <TimerDisplay $warn={timerOn && timerSec < 300}>{fmt(timerSec)}</TimerDisplay>
          <RunBtn style={{ padding: '0.35rem 0.7rem', fontSize: '0.72rem', background: timerOn ? T.red : T.green }} onClick={() => { setTimerOn(t => !t); if (!timerOn) setTimerSec(45 * 60); }}>
            {timerOn ? <X size={12}/> : <Timer size={12}/>} {timerOn ? 'Stop' : '45 min'}
          </RunBtn>
        </div>
      </div>
      <FilterBar>
        {['all','easy','medium','hard'].map(d => <FilterBtn key={d} $active={diffFilter===d} onClick={()=>setDiffFilter(d)}>{d==='all'?'All Difficulty':d.charAt(0).toUpperCase()+d.slice(1)}</FilterBtn>)}
        <span style={{ width: 1, background: T.border, margin: '0 0.15rem' }} />
        {['all','arrays','strings','dp','design'].map(c => <FilterBtn key={c} $active={catFilter===c} onClick={()=>setCatFilter(c)}>{c==='all'?'All Topics':c.charAt(0).toUpperCase()+c.slice(1)}</FilterBtn>)}
      </FilterBar>

      <CodeLayout>
        {/* Problem list */}
        <div>
          <ProbList>
            {filtered.map(p => (
              <ProbItem key={p.id} $active={selected.id===p.id} $solved={solved.has(p.id)} onClick={()=>selectProblem(p)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden' }}>
                  {solved.has(p.id) && <CheckCircle size={11} color={T.green} style={{ flexShrink: 0 }} />}
                  <span style={{ fontSize: '0.79rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                </span>
                <DiffBadge $d={p.difficulty}>{p.difficulty.charAt(0).toUpperCase()}</DiffBadge>
              </ProbItem>
            ))}
            {filtered.length === 0 && <p style={{ fontSize: '0.78rem', color: T.inkLight, padding: '1rem 0.5rem' }}>No problems match these filters.</p>}
          </ProbList>
        </div>

        {/* Problem panel */}
        <ProbPanel>
          <ProbHeader>
            <div style={{ flex: 1 }}>
              <ProbTitle>{selected.title}</ProbTitle>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <DiffBadge $d={selected.difficulty}>{selected.difficulty}</DiffBadge>
                <PatternTag>{selected.pattern}</PatternTag>
                <span style={{ fontSize: '0.7rem', color: T.inkLight, fontFamily: T.mono }}>{selected.category}</span>
              </div>
            </div>
          </ProbHeader>

          <DescBox>
            {selected.description}
            {selected.examples.map((ex, i) => (
              <ExBox key={i}>
                <div><ExLabel>Input</ExLabel>{ex.input}</div>
                <div><ExLabel>Output</ExLabel>{ex.output}</div>
                {ex.explanation && <div style={{ marginTop: '0.25rem', color: T.inkLight, fontSize: '0.74rem' }}>{ex.explanation}</div>}
              </ExBox>
            ))}
            <div style={{ marginTop: '0.5rem', fontSize: '0.74rem', color: T.inkLight }}>
              {selected.constraints.map((c, i) => <div key={i}>• {c}</div>)}
            </div>
          </DescBox>

          <WhyBox><strong>Why interviewers use this:</strong> {selected.whyAsked}</WhyBox>

          <CodeEditor
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            placeholder={`// Write your JavaScript solution\n${selected.starterCode}`}
          />

          <BtnRow>
            <RunBtn onClick={handleRun}><Play size={13}/> Run Tests</RunBtn>
            <HintBtn $used={hintLevel>=0} onClick={handleHint} disabled={hintLevel>=2}>
              <Lightbulb size={13}/> Hint {hintLevel+1}/3
            </HintBtn>
            <SolBtn onClick={()=>setShowSol(s=>!s)}>
              {showSol ? <EyeOff size={13}/> : <Eye size={13}/>} Solution
            </SolBtn>
            <ResetBtn onClick={()=>{ setCode(selected.starterCode); setResults(null); setHintLevel(-1); setShowSol(false); setRuns(0); }}>
              <RotateCcw size={13}/> Reset
            </ResetBtn>
          </BtnRow>

          {/* Hints */}
          {hintLevel >= 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {selected.hints.slice(0, hintLevel + 1).map((h, i) => (
                <HintBox key={i} $level={i}>
                  <HintMeta>Hint {i+1} of 3 — {i===0?'nudge':i===1?'approach':'algorithm'}</HintMeta>
                  {h}
                </HintBox>
              ))}
            </div>
          )}

          {/* Solution */}
          {showSol && (
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: T.red, margin: '0 0 0.4rem' }}>Key Insight — {selected.pattern}</p>
              <InsightBox>{selected.insight}</InsightBox>
              <ComplexRow style={{ marginTop: '0.5rem' }}>
                <ComplexChip>Time: {selected.complexity.time}</ComplexChip>
                <ComplexChip>Space: {selected.complexity.space}</ComplexChip>
              </ComplexRow>
            </div>
          )}

          {/* Test results */}
          {results && (
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: allPassed ? T.green : T.red, margin: '0 0 0.5rem' }}>
                {allPassed ? `✓ All ${results.length} tests passed` : `${results.filter(r=>r.passed).length}/${results.length} tests passed`}
              </p>
              {allPassed && (
                <InsightBox style={{ marginBottom: '0.5rem' }}>
                  <strong>The pattern:</strong> {selected.insight}
                  <ComplexRow style={{ marginTop: '0.4rem' }}>
                    <ComplexChip>Time: {selected.complexity.time}</ComplexChip>
                    <ComplexChip>Space: {selected.complexity.space}</ComplexChip>
                  </ComplexRow>
                </InsightBox>
              )}
              <Results>
                {results.map((r, i) => (
                  <ResultRow key={i} $pass={r.passed}>
                    {r.passed ? <CheckCircle size={13} color={T.green} style={{ flexShrink: 0, marginTop: 1 }}/> : <X size={13} color={T.red} style={{ flexShrink: 0, marginTop: 1 }}/>}
                    <div>
                      <ResultLabel>{r.label}:</ResultLabel>{' '}
                      {r.error
                        ? <ResultDetail style={{ color: T.red }}>Error: {r.error}</ResultDetail>
                        : r.passed
                          ? <ResultDetail style={{ color: T.green }}>✓</ResultDetail>
                          : <ResultDetail>got <strong>{JSON.stringify(r.got)}</strong>, expected <strong>{JSON.stringify(r.expected)}</strong></ResultDetail>
                      }
                    </div>
                  </ResultRow>
                ))}
              </Results>
            </div>
          )}
        </ProbPanel>
      </CodeLayout>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InterviewPrep() {
  const [mode,      setMode]      = useState<Mode>('prep');
  const [company,   setCompany]   = useState('');
  const [role,      setRole]      = useState('');
  const [desc,      setDesc]      = useState('');
  const [round,     setRound]     = useState<Round>('technical');
  const [stack,     setStack]     = useState('');
  const [daysUntil, setDaysUntil] = useState(7);
  const [kit,       setKit]       = useState<PrepKit | null>(null);
  const [section,   setSection]   = useState<KitSection>('gameplan');

  const generate = useCallback(() => {
    if (!company.trim() || !role.trim()) return;
    const k = buildPrepKit(company.trim(), role.trim(), desc, round, stack, daysUntil);
    setKit(k);
    setSection(daysUntil <= 2 ? 'gameplan' : 'behavioral');
  }, [company, role, desc, round, stack, daysUntil]);

  const reset = () => setKit(null);
  const canGenerate = company.trim().length > 0 && role.trim().length > 0;

  const ROUNDS: { key: Round; label: string }[] = [
    { key: 'technical', label: '💻 Technical' },
    { key: 'behavioral', label: '🗣 Behavioral' },
    { key: 'vp', label: '🏢 VP / Director' },
    { key: 'final', label: '🎯 Final Loop' },
  ];

  const SECTIONS: { key: KitSection; label: string; icon: React.ReactNode }[] = [
    { key: 'gameplan',    label: 'Game Plan',       icon: <Calendar size={14}/> },
    { key: 'behavioral',  label: 'Behavioral',      icon: <MessageSquare size={14}/> },
    { key: 'systemdesign',label: 'System Design',   icon: <Cpu size={14}/> },
    { key: 'technical',   label: 'Topics to Study', icon: <BookOpen size={14}/> },
    { key: 'askthem',     label: 'Ask Them',        icon: <HelpCircle size={14}/> },
  ];

  return (
    <Root>
      <GlobalStyle />
      <TopBar>
        <div>
          <Title>Interview Prep</Title>
          <Sub>Customised kit + JavaScript coding practice</Sub>
        </div>
        <ModeToggle>
          <ModeBtn $active={mode==='prep'} onClick={()=>setMode('prep')}><ClipboardList size={14}/> Prep Kit</ModeBtn>
          <ModeBtn $active={mode==='code'} onClick={()=>setMode('code')}><Code2 size={14}/> Code Practice</ModeBtn>
        </ModeToggle>
      </TopBar>

      {/* ── CODE PRACTICE MODE ── */}
      {mode === 'code' && <CodePractice />}

      {/* ── PREP KIT MODE ── */}
      {mode === 'prep' && !kit && (
        <SetupCard>
          <p style={{ fontSize: '0.82rem', color: T.inkLight, marginTop: 0, marginBottom: '1.5rem' }}>
            Enter the details below — your personalised prep kit will include tailored behavioral questions, system design scenarios, technical topics, and a day-by-day schedule.
          </p>
          <FieldGrid>
            <Field>
              <Label>Company *</Label>
              <Input placeholder="e.g. Stripe, Airbnb, startup" value={company} onChange={e=>setCompany(e.target.value)} />
            </Field>
            <Field>
              <Label>Role *</Label>
              <Input placeholder="e.g. Senior Software Engineer" value={role} onChange={e=>setRole(e.target.value)} />
            </Field>
            <FieldFull>
              <Label>Interview Round</Label>
              <RoundGrid>
                {ROUNDS.map(r => <RoundBtn key={r.key} $active={round===r.key} onClick={()=>setRound(r.key)}>{r.label}</RoundBtn>)}
              </RoundGrid>
            </FieldFull>
            <FieldFull>
              <Label>Tech Stack / Tools (optional)</Label>
              <Input placeholder="e.g. React, Node.js, PostgreSQL, AWS" value={stack} onChange={e=>setStack(e.target.value)} />
            </FieldFull>
            <FieldFull>
              <Label>What does this company do? (1–2 sentences)</Label>
              <Textarea placeholder="e.g. B2B SaaS for healthcare billing, uses ML to reduce claim denials." value={desc} onChange={e=>setDesc(e.target.value)} />
            </FieldFull>
            <FieldFull>
              <Label>Days Until Interview</Label>
              <DaysRow>
                <DaysInput type="number" min={0} max={60} value={daysUntil} onChange={e=>setDaysUntil(Math.max(0,parseInt(e.target.value)||0))} />
                <span style={{ fontSize: '0.8rem', color: T.inkLight }}>
                  {daysUntil === 0 ? '🔥 Today — urgent mode' : daysUntil === 1 ? '⚡ Tomorrow' : `${daysUntil} days away`}
                </span>
              </DaysRow>
            </FieldFull>
          </FieldGrid>
          <GenBtn $disabled={!canGenerate} disabled={!canGenerate} onClick={generate}>
            <Sparkles size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Generate My Prep Kit
          </GenBtn>
        </SetupCard>
      )}

      {mode === 'prep' && kit && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: T.inkLight }}>
                Kit for <strong>{company}</strong> — {role} — {round} round — {daysUntil === 0 ? 'today' : `${daysUntil}d away`}
              </p>
            </div>
            <button onClick={reset} style={{ marginLeft: 'auto', background: 'none', border: `1px solid ${T.border}`, borderRadius: T.radiusSm, padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.75rem', color: T.inkMid, fontFamily: T.sans }}>
              ← New Kit
            </button>
          </div>

          <KitWrap>
            <SideNav>
              {SECTIONS.map(s => (
                <SideItem key={s.key} $active={section===s.key} onClick={()=>setSection(s.key)}>
                  {s.icon} {s.label}
                  {section===s.key && <ChevronRight size={12} style={{ marginLeft: 'auto', color: T.inkLight }} />}
                </SideItem>
              ))}
            </SideNav>

            <ContentWrap>
              {section === 'gameplan' && (
                <>
                  <SectionTitle>📅 Game Plan</SectionTitle>
                  {kit.gamePlan.map((g, i) => (
                    <GPBlock key={i}>
                      <GPWhen>{g.when}</GPWhen>
                      {g.tasks.map((t, j) => <GPTask key={j}>{t}</GPTask>)}
                    </GPBlock>
                  ))}
                </>
              )}

              {section === 'behavioral' && (
                <>
                  <SectionTitle>🗣 Behavioral Questions</SectionTitle>
                  <p style={{ fontSize: '0.8rem', color: T.inkLight, marginTop: '-0.5rem', marginBottom: '1rem' }}>
                    Use the STAR format. Click any question to see what the interviewer is looking for.
                  </p>
                  {kit.behavioral.map((q, i) => <BehavQ key={i} q={q} idx={i} />)}
                </>
              )}

              {section === 'systemdesign' && (
                <>
                  <SectionTitle>🏗 System Design</SectionTitle>
                  <p style={{ fontSize: '0.8rem', color: T.inkLight, marginTop: '-0.5rem', marginBottom: '1rem' }}>
                    For each question, think out loud — interviewers evaluate your process, not just the answer.
                  </p>
                  {kit.systemDesign.map((q, i) => (
                    <SDCard key={i}>
                      <SDQ>{i+1}. {q.question}</SDQ>
                      <AngleList>{q.angles.map((a,j) => <Angle key={j}>{a}</Angle>)}</AngleList>
                    </SDCard>
                  ))}
                </>
              )}

              {section === 'technical' && (
                <>
                  <SectionTitle>📚 Topics to Study</SectionTitle>
                  {kit.technical.map((t, i) => (
                    <SDCard key={i}>
                      <SDQ>{t.topic}</SDQ>
                      <AngleList>{t.subtopics.map((s,j) => <Angle key={j}>{s}</Angle>)}</AngleList>
                    </SDCard>
                  ))}
                  <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: T.radiusSm, fontSize: '0.8rem', color: T.accent }}>
                    💡 Switch to <strong>Code Practice</strong> to drill algorithms with an interactive JS runner.
                  </div>
                </>
              )}

              {section === 'askthem' && (
                <>
                  <SectionTitle>❓ Questions to Ask Them</SectionTitle>
                  <p style={{ fontSize: '0.8rem', color: T.inkLight, marginTop: '-0.5rem', marginBottom: '1rem' }}>
                    Asking good questions signals genuine interest and evaluates fit on your terms.
                  </p>
                  {kit.askThem.map((a, i) => (
                    <AskCard key={i}>
                      <AskQ>{i+1}. {a.question}</AskQ>
                      <AskWhy>{a.why}</AskWhy>
                    </AskCard>
                  ))}
                </>
              )}
            </ContentWrap>
          </KitWrap>
        </div>
      )}
    </Root>
  );
}
