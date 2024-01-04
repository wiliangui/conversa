import { Op } from "sequelize";
import Setting from "../../models/Setting";
import { isArray, isObject } from "lodash";
import Campaign from "../../models/Campaign";

interface Data {
  settings: any;
}

const CreateService = async (
  data: Data,
  companyId: number
): Promise<Setting[]> => {
  const settings = [];

  const campaigns = await Campaign.findAll({ attributes: ["id"], where: { companyId } })
  const idCampaigns = campaigns.map(c => c.id);

  for (let settingKey of Object.keys(data.settings)) {
    const value =
      isArray(data.settings[settingKey]) || isObject(data.settings[settingKey])
        ? JSON.stringify(data.settings[settingKey])
        : data.settings[settingKey];

    idCampaigns.forEach(async cId => {
      const [record, created] = await Setting.findOrCreate({
        where: {
          key: settingKey,
          companyId,
          campaignId: cId
        },
        defaults: { key: settingKey, value, companyId, cId }
      });

      if (!created) {
        await record.update({ value });
      }
      settings.push(record);
    });

  }

  return settings;
};

export default CreateService;
