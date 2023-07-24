export function getTokenX24hrsquery(
  tokensArray: string[],
  prevDayEpoch: number
) {
  return tokensArray
    .map((token) => {
      const condition =
        token === 'total'
          ? `depositToken: "${token}"`
          : `optionContract_: {pool: "${token}"}, depositToken_not: "total"`;

      return `${token}24stats:volumePerContracts(
            orderBy: timestamp
            orderDirection: desc
            first: 10000
            where: {${condition}, timestamp_gt: ${prevDayEpoch}}
            ) {
              amount
              settlementFee
            }`;
    })
    .join(' ');
}