import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  contactId: string;
  whatsappId?: number;
}

interface GroupInfo {
  id: string;
  name: string;
  participantsCount: number;
  profilePicUrl?: string;
}

interface Response {
  contactId: number;
  contactName: string;
  contactNumber: string;
  commonGroups: GroupInfo[];
  totalGroups: number;
}

const GetCommonGroupsService = async ({
  contactId,
  whatsappId
}: Request): Promise<Response> => {
  const contact = await Contact.findByPk(contactId);

  if (!contact) {
    throw new AppError("ERR_CONTACT_NOT_FOUND", 404);
  }

  if (contact.isGroup) {
    throw new AppError("ERR_COMMON_GROUPS_NOT_SUPPORTED_FOR_GROUP", 400);
  }

  let sessionId: number | null = whatsappId || null;

  if (!sessionId) {
    const connected = await Whatsapp.findOne({
      where: { status: "CONNECTED", type: "wwebjs" }
    });
    sessionId = connected?.id || null;
  }

  if (!sessionId) {
    throw new AppError("ERR_NO_WHATSAPP_SESSION", 400);
  }

  const wbot = await getWbot(sessionId);

  let numberId;
  try {
    numberId = await wbot.getNumberId(contact.jid || contact.number);
  } catch (err) {
    if (contact.jid && contact.jid.endsWith('@lid') && contact.number) {
      // Fallback: tentar pelo número antigo
      try {
        numberId = await wbot.getNumberId(`${contact.number}@c.us`);
      } catch (fallbackErr) {
        throw new AppError("Não é possível obter informações deste contato porque o WhatsApp não permite essa operação para contas LID.", 400);
      }
    } else {
      throw new AppError("Erro ao consultar informações do contato no WhatsApp.", 500);
    }
  }
  if (!numberId) {
    throw new AppError("ERR_NUMBER_NOT_REGISTERED", 404);
  }

  let commonGroups = [];
  try {
    const wContact = await wbot.getContactById(numberId._serialized);
    commonGroups = await (wContact as any).getCommonGroups();
  } catch (error) {
    console.warn(`[FALLBACK] Erro ao obter contato/grupos comuns do WhatsApp: ${error.message || error}`);
    commonGroups = [];
  }

  const groupsInfo: GroupInfo[] = [];

  for (const group of commonGroups) {
    const groupId = group._serialized || `${group.user}@g.us`;

    try {
      const groupChat = await wbot.getChatById(groupId);

      let profilePicUrl: string | undefined;
      try {
        profilePicUrl = await wbot.getProfilePicUrl(groupId);
      } catch (picError) {
        profilePicUrl = undefined;
      }

      groupsInfo.push({
        id: groupId,
        name: groupChat.name || "Sem nome",
        participantsCount: (groupChat as any).participants?.length || 0,
        profilePicUrl
      });
    } catch (error) {
      groupsInfo.push({
        id: groupId,
        name: "Grupo (erro ao carregar)",
        participantsCount: 0
      });
    }
  }

  return {
    contactId: contact.id,
    contactName: contact.name,
    contactNumber: contact.number,
    commonGroups: groupsInfo,
    totalGroups: groupsInfo.length
  };
};

export default GetCommonGroupsService;
