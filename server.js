// const WebSocket = require('ws');

// const server = new WebSocket.Server({ port: 8080 });

// let totalCount = 0;

// const addTotalCount = () => (totalCount += 1)
// const subTotalCount = () => (totalCount -= 1)
// server.on('connection', (ws) => {
//     console.log('새로운 클라이언트가 연결되었습니다.');
//     addTotalCount()
    // server.clients.forEach(client => {
    //     console.log(totalCount)
    //     if (client.readyState === WebSocket.OPEN) {
    //         client.send(totalCount);
    //     }
    // });
//     ws.on('message', (msg) => {
//         console.log(msg.toString())
//         const message = JSON.parse(msg.toString());
//         console.log(message?.msg);
//         // server.clients.forEach(client => {
//         //     console.log(totalCount)
//         //     if (client.readyState === WebSocket.OPEN) {
//         //         client.send(totalCount);
//         //     }
//         // });

//     });

    // ws.on('close', () => {
    //     console.log('클라이언트가 연결을 종료했습니다.');
    //     subTotalCount();
    //     server.clients.forEach(client => {
    //         console.log(totalCount)
    //         if (client.readyState === WebSocket.OPEN) {
    //             client.send(totalCount);
    //         }
    //     });
        
        
    // });
// });

// console.log('웹소켓 서버가 포트 8080에서 실행 중입니다.');

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
let gameState = "setting"; // 초기 게임 상태
let countdown = 10; // 초기 카운트다운 시간
let timerId;


const clients = new Set(); // 연결된 클라이언트를 저장할 Set

wss.on('connection', (ws) => {
  console.log('새로운 클라이언트가 연결되었습니다.');
  clients.add(ws);
  broadcastClientCount();

  ws.on('message', (msg) => {
    
    const message = JSON.parse(msg.toString());
    if (message === 'startGame') {
      startGame(ws);
    }
  });

  // 새로운 클라이언트에게 현재 게임 상태 전송
  ws.send(`게임 상태: ${gameState}`);

  ws.on('close', () => {
    clients.delete(ws);
    broadcastClientCount();
  });
});

const broadcastClientCount = () => {
  const count = clients.size; // 현재 연결된 클라이언트 수
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      // client.send(`totalCount: ${totalCount}`);
      client.send(JSON.stringify({totalCount: count}));
    }
  });
};

const startGame = (ws) => {
  gameState = "countdown";
  countdown = 10;

   // 카운트다운 시작
  timerId = setInterval(() => {
    if (countdown > 0) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(`카운트다운: ${countdown}`);
        }
      });
      countdown--;
    } else {
      clearInterval(timerId);
      gameState = "playing";
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send("게임 시작!");
          setTimeout(() => {
            const randomTime = Math.random() * 5000;
            setTimeout(() => {
              wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send("버튼 노출!");
                }
              });
              setTimeout(() => {
                wss.clients.forEach(client => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send("게임 종료!");
                  }
                });
              }, 5000); // 5초 후 게임 종료
            }, randomTime);
          }, 1000); // 1초 후 버튼 노출
        }
      });
    }
  }, 1000); // 1초마다 카운트다운
};
