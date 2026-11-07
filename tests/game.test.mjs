import test from 'node:test';
import assert from 'node:assert/strict';
import {createBoard,matches,findMove,swap,adjacent,refill,SIZE} from '../src/game.js';
test('100 fresh boards have no matches and at least one legal move',()=>{for(let n=0;n<100;n++){const b=createBoard();assert.equal(b.length,64);assert.deepEqual(matches(b),[]);const [a,c]=findMove(b);assert(adjacent(a,c));assert(matches(swap(b,a,c)).length>=3);}});
test('row boundaries do not count as adjacency',()=>{assert(!adjacent(7,8));assert(adjacent(0,8));assert(!adjacent(0,9));});
test('cross matches count intersection only once',()=>{const b=Array.from({length:64},(_,i)=>(Math.floor(i/8)+i%8)%5);[18,19,20,11,27].forEach(i=>b[i]=4);assert.deepEqual(new Set(matches(b)),new Set([18,19,20,11,27]));});
test('gravity preserves survivors in order and fills every cell',()=>{const b=Array.from({length:64},(_,i)=>i);const r=refill(b,[48,56],()=>0.4);assert.equal(r[56],40);assert.equal(r[48],32);assert.equal(r[0],2);assert.equal(r[8],2);assert.equal(r[1],1);assert.equal(r.length,SIZE*SIZE);});
test('swap does not mutate source',()=>{const b=createBoard(),copy=[...b];swap(b,0,1);assert.deepEqual(b,copy);});
