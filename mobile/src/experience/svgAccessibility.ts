/** SvgXml forwards unknown props to a raw SVG element on web, unlike RN View. */
export function decorativeSvgProps(platform:string):{accessible?:false;'aria-hidden'?:true}{
 return platform==='web'?{'aria-hidden':true}:{accessible:false};
}
