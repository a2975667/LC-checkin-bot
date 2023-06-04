const { MongoClient } = require('mongodb');
const { mongodbUrl } = require('../config.json');

const client = new MongoClient(mongodbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const getLeaderboard = async (startDate, endDate) => {
    try {
        await client.connect();
        const pipeline = [
          {
            '$addFields': {
              'teamMemberCount': {
                '$size': '$members'
              }
            }
          },
          {
            '$unwind': {
              'path': '$members'
            }
          },
          {
            '$lookup': {
              'from': 'activity',
              'localField': 'members',
              'foreignField': 'memberId',
              'as': 'activity'
            }
          },
          {
            '$unwind': {
              'path': '$activity'
            }
          },
          {
            '$match': {
              '$and': [
                {
                  'activity.date': {
                    '$gte': new Date(startDate)
                  }
                },
                {
                  'activity.date': {
                    '$lte': new Date(endDate)
                  }
                }
              ]
            }
          },
          {
            '$project': {
              'date': '$activity.date',
              'basicQuestionsResponse': {
                '$toInt': '$activity.basicQuestionsResponse'
              },
              'bonusQuestionsResponse': {
                '$toInt': '$activity.bonusQuestionsResponse'
              },
              'memberId': '$members',
              'dateString': {
                '$dateToString': {
                  'format': '%Y-%m-%d',
                  'date': '$activity.date'
                }
              },
              'teamID': '$teamID',
              'teamName': '$teamName',
              'teamMemberCount': '$teamMemberCount'
            }
          },
          {
            '$group': {
              '_id': {
                'teamId': '$teamID',
                'teamName': '$teamName',
                'teamMemberCount': '$teamMemberCount',
                'dateString': '$dateString'
              },
              'checkins': {
                '$addToSet': '$memberId'
              },
              'sumBasic': {
                '$sum': '$basicQuestionsResponse'
              },
              'sumBonus': {
                '$sum': '$bonusQuestionsResponse'
              }
            }
          },
          {
            '$project': {
              'teamId': '$_id.teamId',
              'teamName': '$_id.teamName',
              'teamMemberCount': '$_id.teamMemberCount',
              'dateString': '$_id.dateString',
              'checkedinMemberCount': {
                '$size': '$checkins'
              },
              'sumBasic': 1,
              'sumBonus': 1
            }
          },
          {
            '$group': {
              '_id': '$teamId',
              'datesAllChecked': {
                '$addToSet': {
                  '$cond': [
                    {
                      '$eq': ['$teamMemberCount', '$checkedinMemberCount']
                    },
                    '$_id.dateString',
                    '$$REMOVE'
                  ]
                }
              },
              'sumBasic': {
                '$sum': '$sumBasic'
              },
              'sumBonus': {
                '$sum': '$sumBonus'
              },
              'teamName': {
                '$first': '$teamName'
              }
            }
          }
        ];
      
        const database = client.db('uiucleetcode4tw');
        const collection = database.collection('team');

        const result = await collection.aggregate(pipeline).toArray();
        return result;
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            await client.close();
        }
}   

module.exports = getLeaderboard;
