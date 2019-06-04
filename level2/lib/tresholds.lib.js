export default {            
    0: (nthDay) => nthDay <= 1,
    10: (nthDay) => nthDay >1 && nthDay <= 4,
    30: (nthDay) => nthDay > 4 && nthDay <= 10,
    50: (nthDay) =>  nthDay > 10
}