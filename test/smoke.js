'use strict';

process.env.DONATIONS_DB_PATH = ':memory:';

const assert = require('node:assert/strict');
const {
    logDonation,
    getDonationsByNickname,
    getRecentDonations,
    getDonationSummary,
} = require('../db');

logDonation({
    nickname: 'ci-user',
    amount: 7000,
    title: 'CI',
    group: '02후원a',
    discordUserId: '1',
    discordUserTag: 'ci-user',
});

const records = getDonationsByNickname('ci-user');
assert.equal(records.length, 1);
assert.equal(records[0].amount, 7000);
assert.equal(getRecentDonations().length, 1);
assert.deepEqual(getDonationSummary('ci-user'), { count: 1, total: 7000 });

console.log('Database smoke test passed.');
