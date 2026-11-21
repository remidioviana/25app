import * as Crypto from 'expo-crypto';
import {File,Paths} from 'expo-file-system';
import {ownedTemporaryReport,temporaryReportName} from './temporaryReport';
/** One unpredictable cache path per export, with no overwrite or foreign cleanup. */
export function temporaryReportFile(stem:string,extension:string){return ownedTemporaryReport(new File(Paths.cache,temporaryReportName(stem,extension,Crypto.randomUUID())))}
