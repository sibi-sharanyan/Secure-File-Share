
const getArrayOfRanges = (start , end , length) => {

    let itrcnt =Math.trunc(end/length);
    let rem = end % length;
    let finalArr = [];
   for(let i = 0 ; i < itrcnt ; i++) {
       finalArr.push({
        start: i * length,
        length,
        completePerc : Math.ceil(((i )/itrcnt) * 100)
       })
   }

   if(rem!=0) {
    finalArr.push({
        start: itrcnt* length,
        length : end - itrcnt*length,
        completePerc : 100
       })
   }
   return finalArr;
}


// console.log(getArrayOfRanges(0,1028,20));

module.exports = {
    getArrayOfRanges
}