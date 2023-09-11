function getNDVI(image, NIR, RED, scale) {
    var NDVI = image.expression(
        '(NIR - RED) / (NIR +  RED)', {
            'NIR': image.select(NIR).divide(scale),
            'RED': image.select(RED).divide(scale)
        }).rename("NDVI");
    image = image.addBands(NDVI);
    return image;
  }

function getNDMI(image, NIR, SWIR1, scale) {
    var NDMI = image.expression(
        '(SWIR1 - NIR) / (SWIR1 + NIR)', {
            'NIR': image.select(NIR).divide(scale),
            'SWIR1': image.select(SWIR1).divide(scale)
        }).rename("NDMI");
    image = image.addBands(NDMI);
    return image;
  }

function getNBR(image, NIR, SWIR2, scale) {
    var NBR = image.expression(
        '(SWIR2 - NIR) / (SWIR2 + NIR)', {
            'NIR': image.select(NIR).divide(scale),
            'SWIR2': image.select(SWIR2).divide(scale)
        }).rename("NBR");
    image = image.addBands(NBR);
    return image;
}

function getExpresion(image, expresion, map, index) {
    var expresion = image.expression(
        expresion, 
        map
        ).rename(index);
    image = image.addBands(expresion);
    return image;
}

var indices_ic = {
    "COPERNICUS": {
        "S2_SR_HARMONIZED": {
            "NDVI": {
                "bands": {
                    "NIR": "B8",
                    "RED": "B4"
                },
                "scale": 10000,
                "expression": "(NIR - RED) / (NIR +  RED)",
                "index": "NDVI",
                "map": {
                    "NIR": "image.select('B8').divide(10000)",
                    "RED": "image.select('B4').divide(10000)"
                }
            },
            "NDMI": {
                "bands": {
                    "NIR": "B8",
                    "SWIR1": "B11"
                },
                "scale": 10000
            },
            "NBR": {
                "bands": {
                    "NIR": "B8",
                    "SWIR2": "B12"
                },
                "scale": 10000
            }
        }
    },
    "LANDSAT": {
        "LC09": {
            "NDVI": {
                "bands": {
                    "NIR": "B5",
                    "RED": "B4"
                },
                "scale": 1
            },
            "NDMI": {
                "bands": {
                    "NIR": "B5",
                    "SWIR1": "B6"
                },
                "scale": 1
            },
            "NBR": {
                "bands": {
                    "NIR": "B5",
                    "SWIR2": "B7"
                },
                "scale": 1
            }
        },
        "LC08": {
            "NDVI": {
                "bands": {
                    "NIR": "B5",
                    "RED": "B4"
                },
                "scale": 1
            },
            "NDMI": {
                "bands": {
                    "NIR": "B5",
                    "SWIR1": "B6"
                },
                "scale": 1
            },
            "NBR": {
                "bands": {
                    "NIR": "B5",
                    "SWIR2": "B7"
                },
                "scale": 1
            }
        },
        "LE07": {
            "NDVI": {
                "bands": {
                    "NIR": "B4",
                    "RED": "B3"
                },
                "scale": 1
            },
            "NDMI": {
                "bands": {
                    "NIR": "B4",
                    "SWIR1": "B5"
                },
                "scale": 1
            },
            "NBR": {
                "bands": {
                    "NIR": "B4",
                    "SWIR2": "B7"
                },
                "scale": 1
            }
        }
    }
}

module.exports = {
    getNDVI,
    getNDMI,
    getNBR,
    getExpresion,
    indices_ic
}
