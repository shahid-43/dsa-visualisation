// heapUtils.js

export function heapifyUp(arr, index, isMaxHeap) {
    if (index === 0) return;
    const parentIndex = Math.floor((index - 1) / 2);
    const shouldSwap = isMaxHeap ? arr[index] > arr[parentIndex] : arr[index] < arr[parentIndex];
    if (shouldSwap) {
      [arr[index], arr[parentIndex]] = [arr[parentIndex], arr[index]];
      heapifyUp(arr, parentIndex, isMaxHeap);
    }
  }
  
  export function heapifyDown(arr, index, isMaxHeap) {
    const leftChild = 2 * index + 1;
    const rightChild = 2 * index + 2;
    let targetIndex = index;
  
    if (leftChild < arr.length) {
      const shouldSwapLeft = isMaxHeap ? arr[leftChild] > arr[targetIndex] : arr[leftChild] < arr[targetIndex];
      if (shouldSwapLeft) targetIndex = leftChild;
    }
  
    if (rightChild < arr.length) {
      const shouldSwapRight = isMaxHeap ? arr[rightChild] > arr[targetIndex] : arr[rightChild] < arr[targetIndex];
      if (shouldSwapRight) targetIndex = rightChild;
    }
  
    if (targetIndex !== index) {
      [arr[index], arr[targetIndex]] = [arr[targetIndex], arr[index]];
      heapifyDown(arr, targetIndex, isMaxHeap);
    }
  }
  
  export function buildHeap(arr, isMaxHeap) {
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
      heapifyDown(arr, i, isMaxHeap);
    }
    return arr;
  }