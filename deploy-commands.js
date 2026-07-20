const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');

const commands = [
    new SlashCommandBuilder()
        .setName('후원')
        .setDescription('후원 관련 명령어')
        .addSubcommand(sub =>
            sub.setName('처리')
                .setDescription('후원 처리 및 혜택 지급')
                .addStringOption(o => o.setName('닉네임').setDescription('마크 닉네임').setRequired(true))
                .addIntegerOption(o => o.setName('금액').setDescription('후원 금액').setRequired(true))
                .addStringOption(o => o.setName('칭호').setDescription('커스텀 칭호 내용').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('조회')
                .setDescription('후원 기록 조회')
                .addStringOption(o => o.setName('닉네임').setDescription('조회할 마크 닉네임 (비우면 최근 전체 기록)').setRequired(false))
        )
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {

        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands }
        );

    } catch (error) {
        console.error(error);
    }
})();
