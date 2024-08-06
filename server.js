const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

let flagHolder = null; // 현재 깃발을 가진 클라이언트
let flagTimeout = null; // 깃발 유지 시간
server.on('connection', (ws) => {
    console.log('새로운 클라이언트가 연결되었습니다.');

    ws.on('message', (msg) => {
        const message = msg.toString();
        if (message === 'grabFlag') {
            console.log('start!');

            if (flagHolder) {
                // 이미 깃발을 가진 클라이언트가 있을 경우
                // ws.send('깃발을 빼앗았습니다!');
                ws.send('get');
                flagHolder.send('out');
            } else {
                ws.send('get');
            }

            flagHolder = ws; // 현재 깃발 소유자를 업데이트

            // 5초 후 승자 결정
            if (flagTimeout) clearTimeout(flagTimeout);
            flagTimeout = setTimeout(() => {
                // // 패자에게 메시지 전송
                server.clients.forEach(client => {
                    // client와 flagHolder 비교
                    if (client !== flagHolder && client.readyState === WebSocket.OPEN) {
                        client.send('lose');
                    }
                });

                if (flagHolder) {
                    console.log('win');
                    flagHolder.send('win');
                }

                flagHolder = null; // 승자 결정 후 깃발 소유자 초기화
            }, 5000);
        }
    });

    ws.on('close', () => {
        console.log('클라이언트가 연결을 종료했습니다.');
        if (ws === flagHolder) {
            flagHolder = null; // 깃발 소유자 초기화
        }
    });
});

console.log('웹소켓 서버가 포트 8080에서 실행 중입니다.');
