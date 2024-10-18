document.addEventListener('DOMContentLoaded', () => {
    // 主线程中的代码
    if (window.Worker) {
        // 创建一个新的Worker
        //const myWorker = new Worker('/static/js/worker.js');//到时候这里动态生成url，用模板传递
        workerList = [];
        workerNum = 5
        dataList=[90000,98999,10000,12314,124144]
        promises = runWorkerWithMultiPromise(workerList, workerNum, 'static/js/worker.js', dataList);
        monitorPromises(promises,workerList);
    } else {
        console.log('Your browser doesn\'t support web workers.');
    }
});


function runWorkerWithSinglePromise(workerList, workerNum, workerScript, data) {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < workerNum; i++) {
            const myWorker = new Worker(workerScript);
            myWorker.onmessage = function (e) {
                resolve(e.data);
            };
            myWorker.onerror = function (error) {
                reject(error);
            };
            myWorker.postMessage(data);
            workerList.push(myWorker);
        }
    });
}

function runWorkerWithPromiseList(workerList, workerNum, workerScript, data) {
    // 该函数的缺点是在函数内部等待所有promise都完成再返回一个promise列表
    // 但如果单个任务时间较长，且要求promise及时返回，这种方法就不好了
    // 我的想法是在这个runWorkerMultiPromise函数中传入一个外部list
    // 这个函数异步执行，每完成一个worker（worker settled）向列表中添加一个promise
    // 而外部还有一个异步函数监控list的长度，每当list有新promise添加
    // 就执行操作（比如打印）。
    // 改进后的函数见runWorkerWithMultiPromis
    const promises = [];

    for (let i = 0; i < workerNum; i++) {
        const myWorker = new Worker(workerScript);
        const promise = new Promise((resolve, reject) => {
            myWorker.onmessage = function (e) {
                resolve(e, data);
            };
        });
        myWorker.onmessage = function (e) {
            resolve(e.data);
        };
        myWorker.onerror = function (error) {
            reject(error);
        };
        myWorker.postMessage(data);
        workerList.push(myWorker);
        promises.push(promise);
    }
    return Promise.all(promises);
}

function runWorkerWithMultiPromise(workerList, workerNum, workerScript, dataList) {//
    const promises = [];
    for (let i = 0; i < workerNum; i++) {
        const myWorker = new Worker(workerScript);
        const promise = new Promise((resolve, reject) => {
            //告诉主线程如何处理myWorker发送的消息
            myWorker.onmessage = function (e) {
                //处理worker返回的结果
                console.log('Worker completed with result', e.data);
                resolve(e.data);
            };
            //告诉主线程如何处理worker发生错误的情况
            myWorker.onerror = function (error) {
                console.log('Worker error:', error);
                reject(error);
            };
            //主线程向它创建的worker发送消息
            myWorker.postMessage(dataList[i]);

        });
        workerList.push(myWorker);
        promises.push(promise);
    }
    return promises;
}

function terminateWorkers(workerList) {
    for (const worker of workerList) {
        worker.terminate();
    }
    workerList.length = 0;//清空workerList数组
}

async function monitorPromises(promises,workerList)//监控promise返回状态，不需要等待所有进程完成就可以执行更新数据操作
{
    for (promise of promises) {
        await promise;//等待每个promise完成
        console.log('A worker has finished.');
    }
    await Promise.all(promises);
    console.log('All Workers has finished.');
    terminateWorkers(workerList);
}