const ee = require('@google/earthengine');

const reducers = {
    "mean": ee.Reducer.mean(),
    "median": ee.Reducer.median(),
    "max": ee.Reducer.max(),
    "min": ee.Reducer.min(),
    "stdDev": ee.Reducer.stdDev(),
    "count": ee.Reducer.count(),
    "sum": ee.Reducer.sum()
}

module.exports = {
    reducers
}