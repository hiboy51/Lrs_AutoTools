/*
 * @Author: Kinnon.Z 
 * @Date: 2018-08-04 17:34:18 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-08-06 11:24:20
 */


 /**
  * 顺时针打印一个n * n的矩阵
  *  1, 2, 3, 4,5           1, 2, 3, 4, 5
  * 16,17,18,19,6           6, 7, 8, 9, 10
  * 15,24,25,20,7           11, 12, 13, 14, 15
  * 14,23,22,21,8           16, 17, 18, 19, 20
  * 13,12,11,10,9           21, 22, 23, 24, 25
  */

function swap(arr, m, n) {
    let len = arr.length;
    if (m >= len || n >= len) {
        throw "out of range";
    }
    let tmp = arr[m];
    arr[m] = arr[n];
    arr[n] = tmp;
}

function trunk(arr, num) {
    num = num * 1 || 1;
    var ret = [];
    arr.forEach(function(item, i){
      if(i % num === 0){
        ret.push([]);
      }
      ret[ret.length - 1].push(item);
    });
    return ret;
}

function printMatrixN(n = 2) {
    let totalRound = Math.floor(n / 2) + 1;
    console.log(`totalRound = ${totalRound}`);
    function selectOneRound(roundCount) {
        if (roundCount > totalRound) {
            throw "never happen";
        }

        let sideCount = n - (roundCount - 1) * 2;
        let startIdx = (n + 1) * (roundCount - 1);

        let up = [];
        for (let i = 0; i < sideCount; ++i) {
            up.push(startIdx + i);
        }
        let right = [];
        for (let i = 0; i < sideCount; ++i) {
            right.push((roundCount - 1 + i) * n + n - roundCount);
        }
        
        let btm = [];
        for (let i = 0; i < sideCount; ++i) {
            let start = (n - roundCount) * n + (roundCount - 1);
            btm.push(start + i);
        }
        btm = btm.reverse();
        
        let left = [];
        for (let i = 0; i < sideCount; ++i) {   
            left.push((roundCount - 1 + i) * n + roundCount - 1);
        }
        left = left.reverse();

        // console.log(`
        //     up = ${up}
        //     right = ${right}
        //     btm = ${btm}
        //     left = ${left}
        // `);

        let result = up.concat(right).concat(btm).concat(left).filter((item, index, arr) => {
            return arr.indexOf(item) == index;
        });

        return result;
    }
    
    let testArr = new Array(n * n);
    let c = 1;
    let sort = [];
    while(c <= totalRound) {
        let curRound = selectOneRound(c);
        sort = sort.concat(curRound);
        c++;
    }
    sort.forEach((item, idx, arr) => {
        testArr[item] = idx + 1;
    });

    trunk(testArr, n).forEach(e => console.log(e.join(",")));
}

printMatrixN(5);