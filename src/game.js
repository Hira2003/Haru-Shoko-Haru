export const SIZE = 8;
export const TYPES = 5;
export const MOVES = 30;
export const sizeFor = level => level >= 7 ? 9 : SIZE;
// Numeric tiles: normal 0..4, row bars 5..9, column bars 10..14, jars 15..19.
export const colorOf = tile => tile % TYPES;
export const kindOf = tile => Math.floor(tile / TYPES);
export const targetFor = level => 1800 + (level - 1) * 350;
export const adjacent = (a,b,size=SIZE) => Math.abs(Math.floor(a/size)-Math.floor(b/size)) + Math.abs(a%size-b%size) === 1;
export function swap(board,a,b) { const next=[...board]; [next[a],next[b]]=[next[b],next[a]]; return next; }
export function runs(board) {
  const size=Math.sqrt(board.length), found=[];
  for(const step of [1,size]) for(let line=0;line<size;line++) {
    let run=[];
    for(let pos=0;pos<=size;pos++) {
      const i=step===1?line*size+pos:pos*size+line;
      if(pos===size || (run.length && colorOf(board[i])!==colorOf(board[run[0]]))) {
        if(run.length>=3)found.push(run);
        run=[];
      }
      if(pos<size && board[i]!=null)run.push(i);
    }
  }
  return found;
}
export const matches = board => [...new Set(runs(board).flat())];
export function findMove(board) {
  const size=Math.sqrt(board.length);
  for(let i=0;i<board.length;i++) for(const j of [i+1,i+size]) {
    if(j<board.length && adjacent(i,j,size) && matches(swap(board,i,j)).length) return [i,j];
  }
  return null;
}
export function createBoard(random=Math.random,size=SIZE) {
  for(let attempt=0;attempt<1000;attempt++) {
    const board=[];
    for(let i=0;i<size*size;i++) {
      const options=Array.from({length:TYPES},(_,n)=>n).filter(n=>!(i%size>=2 && board[i-1]===n && board[i-2]===n) && !(i>=size*2 && board[i-size]===n && board[i-2*size]===n));
      board.push(options[Math.floor(random()*options.length)]);
    }
    if(findMove(board)) return board;
  }
  throw new Error('Unable to generate a playable board');
}
// Each connected match creates at most one special. Existing specials activate;
// newly earned specials survive this resolution and fall with gravity.
export function resolveMatches(board,level,preferred=[],random=Math.random) {
  const size=Math.sqrt(board.length), groups=[];
  for(const run of runs(board)) {
    const touching=groups.filter(g=>run.some(i=>g.has(i)));
    const group=new Set(run);
    for(const g of touching){for(const i of g)group.add(i);groups.splice(groups.indexOf(g),1);}
    groups.push(group);
  }
  const removed=new Set(groups.flatMap(g=>[...g])), spawned=new Map();
  if(level>=7)for(const group of groups) {
    const normal=[...group].filter(i=>kindOf(board[i])===0);
    if(group.size<4 || !normal.length)continue;
    const at=preferred.find(i=>normal.includes(i)) ?? normal[Math.floor(normal.length/2)];
    const kind=group.size>=5?3:random()<0.5?1:2;
    spawned.set(at,colorOf(board[at])+kind*TYPES);
  }
  const queue=[...removed], activated=[];
  for(let n=0;n<queue.length;n++) {
    const i=queue[n],kind=kindOf(board[i]);
    if(!kind || level<7)continue;
    activated.push(i);
    const row=Math.floor(i/size),col=i%size, blast=[];
    if(kind===1)for(let c=0;c<size;c++)blast.push(row*size+c);
    if(kind===2)for(let r=0;r<size;r++)blast.push(r*size+col);
    if(kind===3)for(let r=Math.max(0,row-1);r<=Math.min(size-1,row+1);r++)for(let c=Math.max(0,col-1);c<=Math.min(size-1,col+1);c++)blast.push(r*size+c);
    for(const j of blast)if(!removed.has(j)){removed.add(j);queue.push(j);}
  }
  const next=[...board];
  for(const [i,tile] of spawned){next[i]=tile;removed.delete(i);}
  return {board:next,removed:[...removed],spawned:[...spawned.keys()],activated};
}
export function refill(board, removed, random=Math.random) {
  const size=Math.sqrt(board.length),gone=new Set(removed),next=[...board];
  for(let col=0;col<size;col++) {
    const keep=[]; for(let row=0;row<size;row++) if(!gone.has(row*size+col)) keep.push(board[row*size+col]);
    for(let row=size-1;row>=0;row--) next[row*size+col]=keep.length?keep.pop():Math.floor(random()*TYPES);
  }
  return next;
}
