const axios = require("axios");
const ethers = require("ethers");

const dotenv = require("dotenv").config();


const alchemy_key = `https://polygon-mainnet.g.alchemy.com/v2/9VPZHrKVkuzR6gAqaUZi6SpOlBZobRcO`;

let lonftabi = require("./lonft-abi");
let addr_lonft = "0xfC428E6535dC5Fee30fb57cFc93EBB1D92fdCf6e".toLowerCase();
let provider = new ethers.providers.JsonRpcProvider(alchemy_key);
let staker_contract = new ethers.Contract(addr_lonft, lonftabi, provider);

const main = async () => {
  var thresh = ``;
  var result;

  const closed_nfts = new Set();
  let URL = "https://api.thegraph.com/subgraphs/name/crook-ed/lonfts";
  while (true) {
    result = await axios.post(URL, {
      query:
        `
            {
                logCloses(first: 1000, where: {id_gt:"` +
        thresh +
        `"}){
            tokenId
                  }
            }
            `,
    });

    if (Object.values(result.data.data.logCloses).length === 0) break;
    let datas = Object.values(result.data.data.logCloses);
    for(let data of datas){
        closed_nfts.add(data.tokenId);
    }
    // console.log(closed_nfts);
    thresh =
      result.data.data.logCloses[
        Object.values(result.data.data.logCloses).length - 1
      ].id;

  }

  thresh = ``;
  
  const response = {};

  while(true){
    const res = await axios.post(URL, {
        query:
          `
              {
                logCreates(first: 1000, where: {id_gt:"` +
          thresh +
          `"}){
              tokenId
              owner
                    }
              }
              `,
      });
      if (Object.values(res.data.data.logCreates).length === 0) break;
    const datas1 = Object.values(res.data.data.logCreates);

    // console.log(datas1);
   

    for (let data of datas1){
        if(closed_nfts.has(data.tokenId)) {
            continue;
        }
        else{
            


            if(response[data.owner]){
                
                response[data.owner].push(data.tokenId)
            }
            else{
                
                response[data.owner] = [];
                response[data.owner].push(data.tokenId)
            }
        }
    }
    thresh =
    res.data.data.logCreates[Object.values(res.data.data.logCreates).length - 1]
      .id;

  }

  console.log(response);
};
main();