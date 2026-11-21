import {useCallback,useMemo,useState} from 'react';
import {Platform} from 'react-native';
import {useFocusEffect} from 'expo-router';
import * as Sharing from 'expo-sharing';
import {runOperations,shareRunReport} from './runOperations';
import {temporaryReportFile} from './temporaryReportFile';
import {downloadText} from './webDownload';

/** Export the clicked preparation snapshot only while its input view remains focused. */
export function usePreparationExport(input:unknown){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const session=useMemo(()=>({input,operations:runOperations()}),[input]);
 useFocusEffect(useCallback(()=>{
  session.operations.start(setBusy);setError('');
  return ()=>session.operations.dispose();
 },[session]));
 function exportReport(read:()=>string,stem:string,title:string){
  return session.operations.execute(current=>shareRunReport(async()=>read(),current,{
   web:Platform.OS==='web',
   shareText:async text=>{downloadText(text,stem+'.json','application/json;charset=utf-8')},
   file:()=>temporaryReportFile(stem,'json'),
   available:()=>Sharing.isAvailableAsync(),
   shareFile:uri=>Sharing.shareAsync(uri,{mimeType:'application/json',dialogTitle:title}),
  }),()=>{},setError,setBusy,'Preparation export failed.');
 }
 return {busy,error,setError,exportReport};
}
