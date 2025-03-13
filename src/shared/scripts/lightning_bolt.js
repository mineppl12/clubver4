/*export function lightning_bolt(_ctx, stageSize){
    const [ stageWidth, stageHeight ] = [ stageSize.width, stageSize.height ];
    const ctx = _ctx;
    if (!ctx) return;

    const startPoint = [stageWidth / 2, 0];
    const endPoint = [stageWidth / 2, 500];
    let points = [];

    const PARTS = 10;

    points.push(startPoint);

    for (let i = 1; i < PARTS - 1; i++){
        let point = [];
        
        let x = Math.floor(Math.random() * 100) - 50 + points[i - 1][0];
        let y = Math.floor(Math.random() * 500 / PARTS) + 500 / PARTS / 2 + points[i - 1][1];
        
        point = [x, y];

        points.push(point);
    }
    
    points.push(endPoint);

    ctx.beginPath();
    for (const point of points){
        ctx.lineTo(...point);
        ctx.lineCap = 'round';
    }
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.globalCompositeOperation = 'source-over';

    ctx.fillStyle = "rgba(255,255,255,.2)";
    for (const point of points){
        ctx.beginPath();
        ctx.arc(...point, 40, 0, 2 * Math.PI);
        ctx.fill();
    }
}
*/
export function lightning_bolt(_ctx, stageSize) {
    const [stageWidth, stageHeight] = [stageSize.width, stageSize.height];
    const ctx = _ctx;
    if (!ctx) return;

    const startPoint = [stageWidth / 2, 0];
    const endPoint = [stageWidth / 2, 500];
    let points = [];

    const PARTS = 100;
    points.push(startPoint);

    for (let i = 1; i < PARTS; i++) {
        let x = Math.floor(Math.random() * 100) - 50 + points[i - 1][0];
        let y = Math.floor(Math.random() * 20) + points[i - 1][1];

        points.push([x, y]);
    }

    //points.push(endPoint);

    ctx.globalCompositeOperation = 'destination-out';
    // ⚡ 후광 효과 (여러 개의 원 + Blur 적용)
    ctx.shadowBlur = 100;  // 블러 정도 조절 (더 부드러운 후광)
    ctx.shadowColor = "orange";  // 후광 색상

    ctx.globalCompositeOperation = 'source-over';
    for (let size = 40; size >= 10; size -= 10) {  
        ctx.globalAlpha = 1;  // 큰 원일수록 투명
        ctx.fillStyle = "#fff";
        for (const point of points) {
            ctx.beginPath();
            ctx.arc(...point, size, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    // ⚡ 번개 자체 그리기 (얇지만 강한 발광)
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 15;  // 번개 자체에도 살짝 블러 추가
    ctx.shadowColor = "rgba(255, 255, 255, .2)";

    ctx.beginPath();
    for (const point of points) {
        //ctx.lineTo(...point);
        ctx.lineCap = 'round';
    }
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.globalCompositeOperation = 'source-over';
    // 🌟 블러 효과 원상복구
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
}
