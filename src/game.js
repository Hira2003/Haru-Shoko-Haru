export const SIZE = 8;
export const TYPES = 5;
export const MOVES = 30;
export const targetFor = level => 1800 + (level - 1) * 350;
export const adjacent = (a,b) => Math.abs(Math.floor(a/SIZE)-Math.floor(b/SIZE)) + Math.abs(a%SIZE-b%SIZE) === 1;
export function swap(board,a,b) { const next=[...board]; [next[a],next[b]]=[next[b],next[a]]; return next; }
export function matches(board) {
  const hit=new Set();
  for(let row=0;row<SIZE;row++) for(let col=0;col<SIZE;col++) {
    const i=row*SIZE+col, value=board[i]; if(value===null) continue;
    if(col<=SIZE-3 && value===board[i+1] && value===board[i+2]) {
      let k=col; while(k<SIZE && board[row*SIZE+k]===value) hit.add(row*SIZE+k++);
    }
    if(row<=SIZE-3 && value===board[i+SIZE] && value===board[i+2*SIZE]) {
      let k=row; while(k<SIZE && board[k*SIZE+col]===value) hit.add((k++)*SIZE+col);
    }
  }
  return [...hit];
}
export function findMove(board) {
  for(let i=0;i<board.length;i++) for(const j of [i+1,i+SIZE]) {
    if(j<board.length && adjacent(i,j) && matches(swap(board,i,j)).length) return [i,j];
  }
  return null;
}
export function createBoard(random=Math.random) {
  for(let attempt=0;attempt<1000;attempt++) {
    const board=[];
    for(let i=0;i<SIZE*SIZE;i++) {
      const options=Array.from({length:TYPES},(_,n)=>n).filter(n=>!(i%SIZE>=2 && board[i-1]===n && board[i-2]===n) && !(i>=SIZE*2 && board[i-SIZE]===n && board[i-2*SIZE]===n));
      board.push(options[Math.floor(random()*options.length)]);
    }
    if(findMove(board)) return board;
  }
  throw new Error('Unable to generate a playable board');
}
export function refill(board, removed, random=Math.random) {
  const gone=new Set(removed), next=[...board];
  for(let col=0;col<SIZE;col++) {
    const keep=[]; for(let row=0;row<SIZE;row++) if(!gone.has(row*SIZE+col)) keep.push(board[row*SIZE+col]);
    for(let row=SIZE-1;row>=0;row--) next[row*SIZE+col]=keep.length?keep.pop():Math.floor(random()*TYPES);
  }
  return next;
}
