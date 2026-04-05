/**
 * Saint Bot - A WhatsApp Bot
 * Copyright (c) 2025 Slick
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const settings = {
  packname: 'Saint Bot',
  author: 'Slick',
  botName: "Saint Bot",
  botOwner: 'Slick', // Your name
  ownerNumber: '2347071825994', // Your number without + symbol
  
  // Newsletter configuration (update these with your actual newsletter info)
  newsletter: {
    jid: '',  // Your newsletter JID here (e.g., '120363123456789012@newsletter')
    name: 'Saint Bot Channel'  // Your newsletter name
  },
  
  channelLink: 'https://whatsapp.com/channel/', // Your WhatsApp channel link
  supportLink: 'https://chat.whatsapp.com/', // Your support group link
  
  giphyApiKey: 'qnl7ssQChTdPjsKta2Ax2LMaGXz303tq',
  commandMode: "public",
  maxStoreMessages: 20, 
  storeWriteInterval: 10000,
  description: "This is a bot for managing group commands and automating tasks.",
  version: "3.0.7",
  updateZipUrl: "https://github.com/slick/SaintBot-MD/archive/refs/heads/main.zip",
};

export default settings;
