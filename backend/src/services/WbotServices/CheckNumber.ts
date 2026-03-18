import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const CheckContactNumber = async (number: string): Promise<string> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const wbot = getWbot(defaultWhatsapp.id);

  const jid = `${number}@c.us`;
  let validNumber: any = null;
  // Log antes da chamada
  // eslint-disable-next-line no-console
  console.log(`[CheckContactNumber] Chamando wbot.getNumberId para:`, jid);
  try {
    validNumber = await wbot.getNumberId(jid);
    // Log depois da chamada
    // eslint-disable-next-line no-console
    console.log(`[CheckContactNumber] Retorno de wbot.getNumberId:`, validNumber);
    if (!validNumber) {
      // Log detalhado para diagnóstico
      // eslint-disable-next-line no-console
      console.error(`[CheckContactNumber] Número não reconhecido pelo WhatsApp:`, {
        number,
        jid,
        wbotId: wbot.id,
        status: wbot.info?.wid?._serialized,
        sessionState: typeof wbot.getState === 'function' ? await wbot.getState() : 'unknown'
      });
    }
  } catch (err) {
    // Log de erro inesperado
    // eslint-disable-next-line no-console
    console.error(`[CheckContactNumber] Erro ao consultar número no WhatsApp:`, {
      number,
      jid,
      wbotId: wbot.id,
      status: wbot.info?.wid?._serialized,
      sessionState: typeof wbot.getState === 'function' ? await wbot.getState() : 'unknown',
      error: err && err.message ? err.message : err
    });
  }
  return validNumber ? validNumber.user : number;
};

export default CheckContactNumber;
