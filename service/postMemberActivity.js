const { MongoClient } = require('mongodb');
const { mongodbUrl } = require('../config.json');

const client = new MongoClient(mongodbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const storeMemberActivity = async (userid, basicQuestionsResponse, bonusQuestionsResponse, diaryResponse) => {
  // console.log(userid)
  try {
    await client.connect();

    const date = new Date();

    const database = client.db('uiucleetcode4tw');
    const collection = database.collection('activity');

    // check if the user is also stored in the user collection
    // TODO: this should be removed and checks should be done with a different command.
    const userCollection = database.collection('user');
    const user = await userCollection.findOne({ memberId: userid.id });
    // if not, store the user
    if (user === null) {
        const userRecord = {
            memberId: userid.id,
            username: userid.username,
            discriminator: userid.discriminator,
            team: 'none',
        }
        const result = await userCollection.insertOne(userRecord);
    }

    // check if the first two are integers
    if (isNaN(basicQuestionsResponse) || isNaN(bonusQuestionsResponse)) {
        return { success: false, message: '前兩題只能是數字喔!' };
    }

    const activityRecord = {
        memberId: userid.id,
        date: date,
        basicQuestionsResponse: basicQuestionsResponse,
        bonusQuestionsResponse: bonusQuestionsResponse,
        diaryResponse: diaryResponse
    }

    const result = await collection.insertOne(activityRecord);
    const point = parseInt(bonusQuestionsResponse)*2 + parseInt(basicQuestionsResponse);

    if (result.acknowledged === true) {
        message = `<@${userid.id}> 完成了 ${bonusQuestionsResponse} 題 medium/hard 和 ${basicQuestionsResponse} 其他題目. 獲得團隊積分 ${point} 分!\n 同時<@${userid.id}>還完成了: \n ${diaryResponse}. \n Nice work! 🎉🎉🎉`

      return { success: true, message: message };
    } else {
      return { success: false, message: '系統怪怪的，你確定你輸入的是數字/文字嗎?' };
    }
    
  } catch (error) {
    return { success: false, message: error.message };
  } finally {
    await client.close();
  }
};

module.exports = storeMemberActivity;