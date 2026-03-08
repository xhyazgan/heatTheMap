/**
 * Hungarian (Munkres) algorithm for optimal assignment.
 * Given a cost matrix, finds the assignment that minimizes total cost.
 * Supports rectangular matrices (more rows or more columns).
 */
export function solve(costMatrix: number[][]): [number, number][] {
  const nRows = costMatrix.length;
  if (nRows === 0) return [];
  const nCols = costMatrix[0].length;
  if (nCols === 0) return [];

  // Pad to square matrix
  const n = Math.max(nRows, nCols);
  const C: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      i < nRows && j < nCols ? costMatrix[i][j] : 0,
    ),
  );

  // Step 1: Subtract row minimums
  for (let i = 0; i < n; i++) {
    const rowMin = Math.min(...C[i]);
    for (let j = 0; j < n; j++) C[i][j] -= rowMin;
  }

  // Step 2: Subtract column minimums
  for (let j = 0; j < n; j++) {
    let colMin = Infinity;
    for (let i = 0; i < n; i++) colMin = Math.min(colMin, C[i][j]);
    for (let i = 0; i < n; i++) C[i][j] -= colMin;
  }

  const rowMatch = new Array(n).fill(-1);
  const colMatch = new Array(n).fill(-1);

  for (let i = 0; i < n; i++) {
    tryAugment(C, i, rowMatch, colMatch, n);
  }

  // Extract valid assignments (within original matrix bounds)
  const result: [number, number][] = [];
  for (let i = 0; i < nRows; i++) {
    if (rowMatch[i] >= 0 && rowMatch[i] < nCols) {
      result.push([i, rowMatch[i]]);
    }
  }
  return result;
}

function tryAugment(
  C: number[][],
  u: number,
  rowMatch: number[],
  colMatch: number[],
  n: number,
): void {
  const seen = new Array(n).fill(false);

  function dfs(row: number): boolean {
    for (let col = 0; col < n; col++) {
      if (seen[col]) continue;
      if (C[row][col] === 0) {
        seen[col] = true;
        if (colMatch[col] === -1 || dfs(colMatch[col])) {
          rowMatch[row] = col;
          colMatch[col] = row;
          return true;
        }
      }
    }
    return false;
  }

  // Try augmenting with current zeros
  seen.fill(false);
  if (dfs(u)) return;

  // If no augmenting path found with current zeros, need to adjust the matrix
  // Use the full Hungarian step: find minimum uncovered value and adjust
  while (true) {
    // Mark rows and columns
    const rowCovered = new Array(n).fill(false);
    const colCovered = new Array(n).fill(false);

    // Find maximum matching to determine cover
    const tempRowMatch = [...rowMatch];
    const tempColMatch = [...colMatch];

    // Mark unmatched rows
    const reachableRows = new Set<number>();
    const reachableCols = new Set<number>();

    for (let i = 0; i < n; i++) {
      if (tempRowMatch[i] === -1) reachableRows.add(i);
    }

    let changed = true;
    while (changed) {
      changed = false;
      for (const r of reachableRows) {
        for (let c = 0; c < n; c++) {
          if (!reachableCols.has(c) && C[r][c] === 0) {
            reachableCols.add(c);
            changed = true;
          }
        }
      }
      for (const c of reachableCols) {
        if (tempColMatch[c] !== -1 && !reachableRows.has(tempColMatch[c])) {
          reachableRows.add(tempColMatch[c]);
          changed = true;
        }
      }
    }

    // Cover: rows NOT in reachable, columns IN reachable
    for (let i = 0; i < n; i++) rowCovered[i] = !reachableRows.has(i);
    for (let j = 0; j < n; j++) colCovered[j] = reachableCols.has(j);

    // Find minimum uncovered value
    let minVal = Infinity;
    for (let i = 0; i < n; i++) {
      if (rowCovered[i]) continue;
      for (let j = 0; j < n; j++) {
        if (colCovered[j]) continue;
        minVal = Math.min(minVal, C[i][j]);
      }
    }

    if (minVal === Infinity || minVal === 0) {
      // Fallback: adjust by 1 to avoid infinite loop
      minVal = 1;
    }

    // Subtract from uncovered, add to doubly-covered
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (!rowCovered[i] && !colCovered[j]) C[i][j] -= minVal;
        else if (rowCovered[i] && colCovered[j]) C[i][j] += minVal;
      }
    }

    // Try augmenting again
    seen.fill(false);
    if (dfs(u)) return;
  }
}
