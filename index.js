const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('./config.json');
const { logDonation, getDonationsByNickname, getRecentDonations, getDonationSummary } = require('./db');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
    console.log('후원봇 연결됨');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== '후원') return;

    const sub = interaction.options.getSubcommand();

    if (sub === '처리') {
        await handleDonation(interaction);
    } else if (sub === '조회') {
        await handleLookup(interaction);
    }
});

async function handleDonation(interaction) {
    const nick = interaction.options.getString('닉네임');
    const amount = interaction.options.getInteger('금액');
    const title = interaction.options.getString('칭호');

    let group = '';
    if (amount >= 7000) group = '02후원a';
    else if (amount >= 5000) group = '01후원a';
    else {
        await interaction.reply({ content: '금액이 너무 적습니다.', ephemeral: true });
        return;
    }

    await interaction.deferReply();

    try {
        const channel = await interaction.client.channels.fetch(config.commandChannelId);

        const cmds = [
            `lp user ${nick} parent add ${group}`,
            `lp user ${nick} meta setsuffix "&f[${title}]"`,
        ];

        for (const cmd of cmds) {
            await channel.send(cmd);
        }

        logDonation({
            nickname: nick,
            amount,
            title,
            group,
            discordUserId: interaction.user.id,
            discordUserTag: interaction.user.tag,
        });

        const embed = new EmbedBuilder()
            .setTitle('후원 처리 완료')
            .setColor(0x57f287)
            .addFields(
                { name: '닉네임', value: nick, inline: true },
                { name: '금액', value: `${amount.toLocaleString()}원`, inline: true },
                { name: '등급', value: group, inline: true },
                { name: '칭호', value: title },
            )
            .setFooter({ text: `처리자: ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } catch (err) {
        console.error(err);
        await interaction.editReply('처리 중 오류가 발생했습니다. 로그를 확인해주세요.');
    }
}

async function handleLookup(interaction) {
    const nick = interaction.options.getString('닉네임');

    await interaction.deferReply();

    if (nick) {
        const records = getDonationsByNickname(nick, 10);
        const summary = getDonationSummary(nick);

        if (records.length === 0) {
            await interaction.editReply(`**${nick}**님의 후원 기록이 없습니다.`);
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(`${nick}님의 후원 기록`)
            .setColor(0x5865f2)
            .setDescription(
                records.map(r =>
                    `• ${r.created_at} — ${r.amount.toLocaleString()}원 / ${r.group_name} / 칭호: ${r.title}`
                ).join('\n')
            )
            .setFooter({ text: `총 ${summary.count}회, 누적 ${summary.total.toLocaleString()}원` });

        await interaction.editReply({ embeds: [embed] });
    } else {
        const records = getRecentDonations(10);

        if (records.length === 0) {
            await interaction.editReply('아직 등록된 후원 기록이 없습니다.');
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('최근 후원 기록 (전체)')
            .setColor(0x5865f2)
            .setDescription(
                records.map(r =>
                    `• **${r.nickname}** — ${r.created_at} — ${r.amount.toLocaleString()}원 / ${r.group_name}`
                ).join('\n')
            );

        await interaction.editReply({ embeds: [embed] });
    }
}

client.login(config.token);
