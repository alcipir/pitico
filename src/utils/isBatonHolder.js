import withSLP from "./withSLP";

const isBatonHolder = async (SLP, slpAddress, tokenIds) => {
  try {
    const query = {
      q: {
        find: {
          "tokenDetails.tokenIdHex": {
            $in: tokenIds
          },
          "tokenDetails.transactionType": "GENESIS"
        },
        limit: 1000
      },
      v: 3
    };
    const slpDbInstance = SLP.SLPDB;
    const queryResults = await slpDbInstance.get(query);
    const queryResultsForGenesisTransaction = await SLP.Transaction.details(
      queryResults.t
        .filter(t => t.mintBatonUtxo && t.mintBatonUtxo.replace(":2", ""))
        .map(t => t.mintBatonUtxo.replace(":2", ""))
    );
    return tokenIds.map((r, i) => ({
      ...queryResults.t[i].tokenDetails,
      hasBaton:
        queryResultsForGenesisTransaction[i] &&
        queryResultsForGenesisTransaction[i].vin &&
        SLP.Address.toSLPAddress(queryResultsForGenesisTransaction[i].vin[0].cashAddress) ===
          slpAddress
    }));
  } catch (e) {
    return [];
  }
};

export default withSLP(isBatonHolder);
