'use strict';

var exp = module.exports;

exp.role = [
	{
		name: '弓箭手',
		variation: 70,// 变异值
		variationTime: 6000,// 变异时间(毫秒)
		hero: 
		{
			hp: 100, // 血量
			attack: 3, // 攻击力
			moveSpeed: 110,// 移动速度
		},
		zombie: 
		{
			hp: 300, // 血量
			attack: 14, // 攻击力
			moveSpeed: 70,// 移动速度
		}
	}
];