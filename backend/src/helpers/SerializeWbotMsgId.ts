import Message from "../models/Message";
import Ticket from "../models/Ticket";

const SerializeWbotMsgId = (ticket: Ticket, message: Message): string => {
  const cleanNumber = ticket.contact.number.replace(/@(c|g)\.us$/, '');

    const jid = ticket.contact.jid || `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`;
    const cleanJid = jid.replace(/@(c|g)\.us$/, '');
    const serializedMsgId = `${message.fromMe}_${cleanJid}@${ticket.isGroup ? "g" : "c"}.us_${message.id}`;
    return serializedMsgId;
};

export default SerializeWbotMsgId;
