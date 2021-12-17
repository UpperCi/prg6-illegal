const express = require('express');
const app = express();
const bp = require('body-parser');

app.use(bp.json())
app.use(bp.urlencoded({extendedparser: true}));

const baseUrl = "http://145.24.222.204:8001/api/";

let lastRequest = 0;
let requestNum = 1;
let basItem = {};

app.use('/api', function (req, res) {
    if (Date.now() - lastRequest > 1000) { // check if last request was less a second ago
        requestNum = 1;
        console.log("------started new request-chain! ------")
    } else {
        requestNum++;
    }
    lastRequest = Date.now();
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Methods", "Origin, Content-Type, Accept");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    switch (requestNum) {
        case 1: // checkt enkel of er JSON terugkomt
            res.json("hi");
            break;
        
        case 2:
            res.header({ 'Allow': 'GET,POST,OPTIONS' });
            res.send();
            break;
        
        case 3:
            res.status(400).send();
            break;
        
        case 4: // checkt voor items, links en pagination
            res.json({
                "items": [
                    ...multipleItems(6)
                ],
                ...getLinks(),
                ...getPagination()
            }).send();
            break;
        case 5: // checkt voor pagination met start=3&limit=1
            res.json({...getPagination(true), "items": [generateItem('3')]});
            break;
        
        case 6: // checkt detail view van willekeurig item
            let id = req.url.substring(1);
            res.json({...generateItem(id), ...getLinks(id)})
            break;
        
        case 7:
            res.status(404).send();
            break;
        
        case 8:
            res.status(400).send();
            break;
        
        case 9: // maakt element aan
            basItem = generateCustomItem(req.body.attr1, req.body.attr2, req.body.attr3);
            res.status(201).send();
            break;
        
        case 10:
            res.json({
                "items": [
                    ...multipleItems(6), basItem
                ]
            })
            break;
        
        case 11:
            res.json(basItem);
            break;
        
        case 12:
            basItem = generateCustomItem(req.body.attr1, req.body.attr2, req.body.attr3);
            res.send();
            break;
        
        case 13:
            res.json(basItem);
            break;
        
        case 14:
            res.status(400).send();
            break;

        case 15:
            res.header({ 'Allow': 'GET,DELETE,PUT,OPTIONS' });
            res.send();
            break;

        case 16:
            res.status(400).send();
            break;
        
        case 17:
            res.status(204).send();
            break;
        
        case 18:
            res.status(404).send();
            break;
        
        case 19:
            basItem = generateCustomItem(req.body.attr1, req.body.attr2, req.body.attr3);
            res.status(201).send();
            break;
        
        case 20:
            res.json({
                "items": [
                    ...multipleItems(6), basItem
                ]
            })
            break;
        
        case 21:
            res.json(basItem)
            break;
        
        case 22:
            res.status(204).send();
            break;

        default:
            res.json("hi")
            break;
    }
    // res.json({ 'message': "Hi world!" });
    console.log(requestNum);
});

// ---------- helper functions ----------
function generateItem(id) {
    return {
        "_id": id,
        "attr1": "1",
        "attr2": "2",
        "attr3": "3",
        ...getLinks(id),
        "__v": "0"
    };
}

function generateCustomItem(attr1, attr2, attr3) {
    return {
        "_id": 'bas',
        "attr1": attr1,
        "attr2": attr2,
        "attr3": attr3,
        ...getLinks('bas')
    };
}

function getLinks(id = "") {
    return {
        "_links":
        {
            'self': {
                'href': baseUrl + id
            },
            'collection': {
                'href': baseUrl
            }
        }
    };
}

function getPagination(doLimit = false) {
    let base = doLimit ? 3 : 1;
    return {
        "pagination": {
            "currentPage": base,
            "currentItems": doLimit ? 1 : 6,
            "totalPages": doLimit ? 6 : 1,
            "totalItems": 6,
            "_links": {
                "first": {
                    "page": 1,
                    "href": baseUrl + "?start=1&limit=1"
                },
                "last": {
                    "page": 6,
                    "href": baseUrl + "?start=6&limit=1"
                },
                "previous": {
                    "page": Math.max(1, base - 1),
                    "href": baseUrl + "?start=2&limit=1"
                },
                "next": {
                    "page": base + 1,
                    "href": baseUrl + "?start=4&limit=1"
                }
            }
        }
    };
}

function multipleItems(n) {
    let items = [];
    for (let i = 0; i < n; i++) { items.push(generateItem(`${i}`)) }
    return items;
}

app.listen(8001, () => console.log('listening on port 8001'));
