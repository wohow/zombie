
/**
*　常量
*/
var exp = module.exports;

exp.rtt = 10;// rtt 记录往返延迟

/** 服务器地址 */
exp.connectorAddress = 
{
	// host: '192.168.1.103', //家IP
	// host: '192.168.1.148', //公司IP
	// host: '120.77.48.203',// 采田
    host: 'mc.hhhhhh.org',
	port: 50200,
	log: true
};
// 英雄信息
exp.HERO = [
	{
		name: '弓箭手',
		hero:
		{
			skillicons: [0, 0],
			skillcds: [0.6, 12]
		},
		zombie:
		{
			skillicons: [0, 0],
			skillcds: [1.2, 5]
		}
	},
	{
		name: '战士',
		hero:
		{
			skillicons: [0, 0],
			skillcds: [1.2, 5]
		},
		zombie:
		{
			skillicons: [0, 0],
			skillcds: [1, 5]
		}
	},
];

// 地图名字
exp.MAP_NAME = ['随机地图', '沙漠灰', '大草坪'];
// 状态名字
exp.STATUS_NAME = ['准备中', '游戏中'];
exp.STATUS_COLOR = [cc.Color.GREEN, cc.Color.RED];