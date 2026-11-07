import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, useWindowDimensions, ScrollView, Modal, Animated, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SIZE, MOVES, createBoard, matches, swap, adjacent, refill, findMove, targetFor } from './src/game';
const chocolates=[require('./assets/blue.png'),require('./assets/purple.png'),require('./assets/pink.png'),require('./assets/yellow.png'),require('./assets/green.png')];
const names=['blue bar','purple bonbon','pink heart','yellow star','green square'];
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function Game() {
  const {width}=useWindowDimensions(); const cell=Math.floor((Math.min(width,480)-44)/SIZE);
  const [board,setBoard]=useState(()=>createBoard()); const [level,setLevel]=useState(1); const [score,setScore]=useState(0); const [moves,setMoves]=useState(MOVES);
  const [selected,setSelected]=useState(null); const [clearing,setClearing]=useState([]); const [hint,setHint]=useState([]); const [busy,setBusy]=useState(false); const [ready,setReady]=useState(false);
  const [message,setMessage]=useState('A little chocolate happiness'); const [result,setResult]=useState(null); const [help,setHelp]=useState(false);
  const lock=useRef(false), alive=useRef(true), fade=useRef(new Animated.Value(1)).current;
  const target=targetFor(level);
  useEffect(()=>{ AsyncStorage.getItem('haru-level').then(v=>{const n=Number(v);if(Number.isInteger(n)&&n>0)setLevel(n);}).catch(()=>{}).finally(()=>setReady(true));return()=>{alive.current=false;}; },[]);
  function start(nextLevel) { if(lock.current)return; setLevel(nextLevel);setBoard(createBoard());setScore(0);setMoves(MOVES);setSelected(null);setHint([]);setResult(null);setMessage('A little chocolate happiness'); }
  async function tap(i) {
    if(lock.current||result||!ready)return;
    setHint([]);
    if(selected===null){setSelected(i);return;}
    if(selected===i){setSelected(null);return;}
    if(!adjacent(selected,i)){setSelected(i);return;}
    lock.current=true;setBusy(true);setSelected(null);
    let next=swap(board,selected,i);setBoard(next);await pause(160);
    let hit=matches(next);
    if(!hit.length){if(alive.current){setBoard(board);setMessage('Try a match of three — no move lost');setBusy(false);}lock.current=false;return;}
    const remaining=moves-1;setMoves(remaining);let total=score,combo=0;
    while(hit.length) {
      combo++; const points=hit.length*10*combo;total+=points;
      setClearing(hit);setMessage(combo>1?`Sweet cascade ×${combo}  +${points}`:`Sweet match!  +${points}`);
      await new Promise(resolve=>Animated.timing(fade,{toValue:0,duration:230,useNativeDriver:Platform.OS!=='web'}).start(resolve));
      if(!alive.current)return;
      next=refill(next,hit);setBoard(next);setClearing([]);fade.setValue(1);setScore(total);await pause(150);hit=matches(next);
      if(combo>=100){next=createBoard();setBoard(next);break;}
    }
    if(total>=target){setResult('won');AsyncStorage.setItem('haru-level',String(level+1)).catch(()=>{});}
    else if(remaining===0)setResult('lost');
    else if(!findMove(next)){setBoard(createBoard());setMessage('Fresh chocolates! Free reshuffle');}
    setBusy(false);lock.current=false;
  }
  return <LinearGradient colors={['#fff6f4','#f4e9fb','#e5dcf7']} style={styles.fill}><StatusBar style="dark"/><SafeAreaView style={styles.fill}><ScrollView contentContainerStyle={styles.screen}>
    <View style={styles.header}><View><Text style={styles.eyebrow}>HARU’S CHOCOLATERIE</Text><Text style={styles.title}>Shoko Haru<Text style={styles.spark}> ✦</Text></Text></View><Pressable accessibilityRole="button" accessibilityLabel="How to play" onPress={()=>setHelp(true)} style={styles.circle}><Text style={styles.question}>?</Text></Pressable></View>
    <View style={styles.ribbon}><Text style={styles.ribbonText}>✦  LEVEL {level.toString().padStart(2,'0')}  ✦</Text><Text style={styles.caption}>Match a little joy</Text></View>
    <View style={styles.stats}><View style={styles.stat}><Text style={styles.label}>SCORE</Text><Text style={styles.value}>{score.toLocaleString()}</Text></View><View style={[styles.stat,styles.moveStat]}><Text style={styles.moveLabel}>MOVES</Text><Text style={styles.moveValue}>{moves}</Text></View><View style={styles.stat}><Text style={styles.label}>TARGET</Text><Text style={styles.value}>{target.toLocaleString()}</Text></View></View>
    <View style={styles.progressRow}><Text style={styles.tiny}>Your sweet goal</Text><Text style={styles.tiny}>{Math.min(100,Math.floor(score/target*100))}%</Text></View><View style={styles.track}><View style={[styles.progress,{width:`${Math.min(100,score/target*100)}%`}]}/></View>
    <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>
    <View style={styles.boardFrame}><View style={{width:cell*SIZE,flexDirection:'row',flexWrap:'wrap'}}>{board.map((type,i)=><Pressable key={i} accessibilityRole="button" accessibilityLabel={`${names[type]}, row ${Math.floor(i/SIZE)+1}, column ${i%SIZE+1}`} accessibilityState={{selected:selected===i,disabled:busy}} disabled={busy||!ready} onPress={()=>tap(i)} style={[styles.cell,{width:cell,height:cell,backgroundColor:(Math.floor(i/SIZE)+i%SIZE)%2?'#f5e9fa':'#fff8fc'},(selected===i||hint.includes(i))&&styles.selected]}><Animated.Image source={chocolates[type]} resizeMode="contain" style={{width:'100%',height:'100%',opacity:clearing.includes(i)?fade:1}}/></Pressable>)}</View></View>
    <Text style={styles.instructions}>Tap a chocolate, then a neighbor to swap.</Text><View style={styles.actions}><Pressable accessibilityRole="button" disabled={busy} style={styles.secondary} onPress={()=>{setSelected(null);setHint(findMove(board)||[]);setMessage('These two make a sweet match');}}><Text style={styles.buttonText}>✧  Hint</Text></Pressable><Pressable accessibilityRole="button" disabled={busy} style={styles.secondary} onPress={()=>setResult('restart')}><Text style={styles.buttonText}>↻  Restart</Text></Pressable></View><Text style={styles.footer}>Wrapped with love, by Haru ♡</Text>
  </ScrollView></SafeAreaView>
  <Modal visible={!!result||help} transparent animationType="fade" onRequestClose={()=>{if(help)setHelp(false);else if(result==='restart')setResult(null);}}><View style={styles.overlay}><View style={styles.dialog}><Image source={chocolates[result==='lost'?1:2]} style={styles.hero} resizeMode="contain"/><Text style={styles.dialogTitle}>{help?'A sweet little guide':result==='won'?'Delicious victory!':result==='restart'?'Start fresh?':'One more sweet try?'}</Text><Text style={styles.dialogText}>{help?'Swap neighboring chocolates to line up 3 or more horizontally or vertically. Each cleared chocolate earns 10 points. Cascades multiply your points! Reach the target in 30 moves. Swaps without a match cost nothing.':result==='won'?`Level ${level} complete • ${score.toLocaleString()} points`:result==='restart'?'This will reset the score and moves for this level.':`You scored ${score.toLocaleString()} of ${target.toLocaleString()} points. Try again with 30 fresh moves.`}</Text><Pressable accessibilityRole="button" style={styles.primary} onPress={()=>help?setHelp(false):start(result==='won'?level+1:level)}><Text style={styles.primaryText}>{help?'Let’s play':result==='won'?'Next level  →':result==='restart'?'Restart level':'Try again'}</Text></Pressable>{result==='restart'&&<Pressable onPress={()=>setResult(null)} style={{padding:14}}><Text style={styles.buttonText}>Keep playing</Text></Pressable>}</View></View></Modal>
  </LinearGradient>;
}
export default function App(){return <SafeAreaProvider><Game/></SafeAreaProvider>;}
const styles=StyleSheet.create({fill:{flex:1},screen:{alignSelf:'center',width:'100%',maxWidth:480,paddingHorizontal:16,paddingTop:18,paddingBottom:16},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},eyebrow:{fontSize:10,letterSpacing:2.4,color:'#9a6c9b',fontWeight:'700'},title:{fontSize:32,fontWeight:'800',color:'#513460',marginTop:3},spark:{color:'#cf94bd'},circle:{width:36,height:36,borderRadius:18,backgroundColor:'#ffffffa0',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#e8d3e7'},question:{fontSize:19,fontWeight:'700',color:'#8c699c'},ribbon:{alignItems:'center',paddingTop:22,paddingBottom:14},ribbonText:{fontSize:13,fontWeight:'800',letterSpacing:3,color:'#a7739b'},caption:{fontSize:17,color:'#6f5079',marginTop:6,fontStyle:'italic'},stats:{flexDirection:'row',alignItems:'center',gap:10},stat:{flex:1,backgroundColor:'#ffffffac',borderRadius:20,paddingVertical:13,alignItems:'center',borderWidth:1,borderColor:'#fff'},label:{color:'#96799f',fontSize:10,letterSpacing:1.5,fontWeight:'800'},value:{fontSize:25,fontWeight:'800',color:'#684b78',marginTop:4},moveStat:{backgroundColor:'#9970b6',borderColor:'#b18bc9',paddingVertical:16},moveLabel:{color:'#f3deff',fontSize:10,letterSpacing:1.5,fontWeight:'800'},moveValue:{fontSize:35,fontWeight:'800',color:'white'},progressRow:{flexDirection:'row',justifyContent:'space-between',marginTop:17,marginBottom:6},tiny:{fontSize:11,color:'#96769c',fontWeight:'600'},track:{height:8,backgroundColor:'#e4d3ed',borderRadius:8,overflow:'hidden'},progress:{height:'100%',backgroundColor:'#d99ac3',borderRadius:8},message:{textAlign:'center',fontSize:12,color:'#95739e',height:36,paddingTop:12},boardFrame:{alignSelf:'center',padding:5,borderRadius:21,backgroundColor:'#d3b9e2',borderWidth:1,borderColor:'#c5a8d5',overflow:'hidden',boxShadow:'0px 8px 20px #72548622'},cell:{padding:2,borderWidth:2,borderColor:'transparent',borderRadius:9},selected:{borderColor:'#a05bc5',backgroundColor:'#e5c8f5'},instructions:{textAlign:'center',fontSize:11,color:'#93789e',marginTop:17},actions:{flexDirection:'row',gap:12,marginTop:15,justifyContent:'center'},secondary:{paddingVertical:12,paddingHorizontal:24,borderRadius:18,backgroundColor:'#ffffffa8',borderWidth:1,borderColor:'#fff'},buttonText:{color:'#81618e',fontWeight:'700',fontSize:13},footer:{color:'#a38aad',fontSize:11,textAlign:'center',marginTop:20},overlay:{flex:1,backgroundColor:'#39234488',justifyContent:'center',alignItems:'center',padding:25},dialog:{width:'100%',maxWidth:360,backgroundColor:'#fff7fc',borderRadius:30,padding:26,alignItems:'center'},hero:{height:110,width:120,marginBottom:12},dialogTitle:{fontSize:25,fontWeight:'800',color:'#684378',textAlign:'center'},dialogText:{textAlign:'center',color:'#92749d',fontSize:14,lineHeight:23,marginVertical:17},primary:{backgroundColor:'#986bb4',borderRadius:18,paddingVertical:16,paddingHorizontal:30,width:'100%',alignItems:'center'},primaryText:{fontWeight:'800',color:'white',fontSize:15}});
