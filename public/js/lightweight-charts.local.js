/* Local compatibility chart: no third-party network dependency. */
(function(){
  window.LightweightCharts={
    createChart:function(el,opts){
      const h=(opts&&opts.height)||320;
      const c=document.createElement('canvas');
      c.width=Math.max(1,el.clientWidth)*2;c.height=h*2;c.style.width='100%';c.style.height=h+'px';el.appendChild(c);
      const ctx=c.getContext('2d');
      return {addLineSeries:function(){return {setData:function(data){
        ctx.clearRect(0,0,c.width,c.height);if(!data||data.length<2)return;
        const vals=data.map(x=>Number(x.value??x.close??x.price??0)),min=Math.min(...vals),max=Math.max(...vals);
        ctx.strokeStyle='#ff8b0b';ctx.lineWidth=4;ctx.beginPath();
        vals.forEach((v,i)=>{const x=i*(c.width/(vals.length-1)),y=c.height-20-(v-min)/(max-min||1)*(c.height-40);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
      }}}};
    }
  };
})();
