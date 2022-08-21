const Url = require('url');
const querystring = require('querystring');

const escapeRegExp = s => s.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
module.exports.escapeRegExp = escapeRegExp;

module.exports.checkBatchim = word => {
    if (typeof word !== Options.String) return null;

    let lastLetter = word[word.length - 1];

    if(/[a-zA-Z]/.test(lastLetter)) {
        const moem = [ 'a' , 'e' , 'i' , 'o' , 'u' ];
        return moem.includes(lastLetter);
    }

    if(!isNaN(lastLetter)) {
        const k_number = '일이삼사오육칠팔구십'.split('');
        for(let i = 1; i <= 10; i++) {
            lastLetter = lastLetter.replace(new RegExp(escapeRegExp(i), 'g'), k_number[i - 1]);
        }
    }
    const uni = lastLetter.charCodeAt(0);

    if (uni < 44032 || uni > 55203) return null;

    return (uni - 44032) % 28 !== 0;
}

module.exports.getYoilString = num => {
    const yoilmap = [
        '일',
        '월',
        '화',
        '수',
        '목',
        '금',
        '토'
    ]

    return yoilmap[num];
}

module.exports.getEnglishMonthString = num => {
    const monthmap = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]

    return monthmap[num - 1];
}

module.exports.chunk = (str, n, put) => {
    return Array.from(Array(Math.ceil(str.length/n)), (_,i)=>str.slice(i*n,i*n+n)).join(put);
}

module.exports.parseYouTubeLink = link => {
    const parsedUrl = Url.parse(link);
    const parsedQuery = querystring.parse(parsedUrl.query);

    let videoCode;

    if([ 'youtube.com' , 'www.youtube.com' ].includes(parsedUrl.host)) videoCode = parsedQuery.v;
    if([ 'youtu.be' ].includes(parsedUrl.host)) videoCode = parsedUrl.path.slice(1);

    return {
        videoCode
    }
}

module.exports.increaseBrightness = (hex, percent) => {
    hex = hex.replace(/^\s*#|\s*$/g, '');

    if(hex.length === 3) {
        hex = hex.replace(/(.)/g, '$1$1');
    }

    const r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16);

    return '#' +
        ((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
        ((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
        ((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}

module.exports.getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max + 1);
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.msToTime = duration => {
    // const weeks = duration / (1000 * 60 * 60 * 24 * 7);
    // const absoluteWeeks = Math.floor(weeks);
    // const w = absoluteWeeks ? (absoluteWeeks + '주 ') : '';

    // const days = (weeks - absoluteWeeks) * 7;
    const days = duration / (1000 * 60 * 60 * 24);
    const absoluteDays = Math.floor(days);
    const d = absoluteDays ? (absoluteDays + '일 ') : '';

    const hours = (days - absoluteDays) * 24;
    const absoluteHours = Math.floor(hours);
    const h = absoluteHours ? (absoluteHours + '시간 ') : '';

    const minutes = (hours - absoluteHours) * 60;
    const absoluteMinutes = Math.floor(minutes);
    const m = absoluteMinutes ? (absoluteMinutes + '분 ') : '';

    const seconds = (minutes - absoluteMinutes) * 60;
    const absoluteSeconds = Math.floor(seconds);
    const s = absoluteSeconds ? (absoluteSeconds + '초 ') : '';

    return (/* w + */ d + h + m + s).trim();
}