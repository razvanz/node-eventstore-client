const shuffle = require('../../../../src/common/utils/shuffle');

describe('shuffle', () => {
  test('Should return a shuffle array (same size, different order)', async () => {
    // arrange
    const tArray = [1,2,3,4,5,6,7,8,9];
    // act
    const result = shuffle(tArray);
    // assert
    expect(result).toHaveLength(tArray.length);
    expect(result).not.toEqual(tArray);
  });

  test('Should return a shuffle array for array of size 1', async () => {
    // arrange
    const tArray = [1];
    // act
    const result = shuffle(tArray);
    // assert
    expect(result).toHaveLength(tArray.length);
    expect(result).toEqual(tArray);
  });

  test('Should return a shuffle array for array of size 0', async () => {
    // arrange
    const tArray = [];
    // act
    const result = shuffle(tArray);
    // assert
    expect(result).toHaveLength(tArray.length);
    expect(result).toEqual(tArray);
  });
  
  test('Should return a shuffle only from a starting point', async () => {
    // arrange
    const tArray = [1,2,3,4,5,6,7,8,9];
    // act
    const result = shuffle(tArray, 2);
    // assert
    expect(result).toHaveLength(tArray.length);
    expect(result).not.toEqual(tArray);
    const fixedOrigin = [...tArray].splice(0, 2);
    const shuffledOrigin = [...tArray].splice(2);
    const fixedResult= [...result].splice(0, 2);
    const shuffledResult = [...result].splice(2);
    expect(fixedResult).toHaveLength(fixedOrigin.length);
    expect(fixedResult).toEqual(fixedOrigin);
    expect(shuffledResult).toHaveLength(shuffledOrigin.length);
    expect(shuffledResult).not.toEqual(shuffledOrigin);
  });
  
  test('Should return a shuffle only from a starting point to and end point', async () => {
    // arrange
    const tArray = [1,2,3,4,5,6,7,8,9];
    // act
    const result = shuffle(tArray, 2, 4);
    // assert
    expect(result).toHaveLength(tArray.length);
    expect(result).not.toEqual(tArray);
    const fixedStartOrigin = [...tArray].splice(0, 2);
    const fixedEndOrigin = [...tArray].splice(4);
    const shuffledOrigin = [...tArray].splice(2, 4);
    const fixedStartResult= [...result].splice(0, 2);
    const fixedEndResult = [...tArray].splice(4);
    const shuffledResult = [...result].splice(2, 4);
    expect(fixedStartResult).toHaveLength(fixedStartOrigin.length);
    expect(fixedStartResult).toEqual(fixedStartOrigin);
    
    expect(fixedEndResult).toHaveLength(fixedEndOrigin.length);
    expect(fixedEndResult).toEqual(fixedEndOrigin);

    expect(shuffledResult).toHaveLength(shuffledOrigin.length);
    expect(shuffledResult).not.toEqual(shuffledOrigin);
  });
});