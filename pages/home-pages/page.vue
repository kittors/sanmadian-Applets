<template>
	<view>
		<!-- 顶部 -->
		<view class="top-view">
			<view>10人就餐</view>
			<view class="top-view-flex">
				<image src="/static/tab/fenxiang.svg" mode="widthFix" class="top-search"></image>
				<image src="/static/tab/dingdan.svg" mode="widthFix"></image>
			</view>
		</view>
		<!-- 点餐界面 -->
		<view class="order-view">
			<view class="commodity">
				<!-- 左边的 -->
				<view class="order-left">
					<scroll-view scroll-y="true" class="scroll-Hei" :scroll-with-animation="true">
						<block v-for="(item, index) in itemize" :key="index">
							<view class="itemize-text" :class="{ active: index == trigger }" @click="itemIze(index,item.cid)">
								<text>{{ item.value }}</text>
								<text v-if="item.sele_quantity != 0">{{ item.sele_quantity }}</text>
							</view>
						</block>
					</scroll-view>
				</view>
				<!-- 右边 -->
				<view class="order-right">
					<scroll-view
						scroll-y="true"
						class="scroll-Hei"
						@scrolltolower=""
						:scroll-with-animation="true"
						:enhanced="true"
						:show-scrollbar="false"
						:scroll-into-view="scroll_into"
						@scroll="scroLl"
					>
						<block v-for="(item, index) in goods" :key="index">
							<view :id="item.cid" class="rig-height">
								<view class="classif">{{ item.category }}</view>
								<view class="classif-goods" v-for="(itemgood, good_index) in item.good_query" :key="good_index">
									<view class="goods-image"><image :src="itemgood.image[0].url" mode="aspectFill"></image></view>
									<view class="goods-Price">
										<view class="goods-name">
											<text class="Bold">{{ itemgood.name }}</text>
											<text class="Thinning">已售 {{ itemgood.monthlysale }}</text>
										</view>
										<view class="unit-price">
											<text class="Symbol">¥</text>
											<text class="Bold">{{ itemgood.unitprice }}</text>
											<text class="Thinning">/{{ itemgood.unit }}</text>
										</view>
									</view>
									<view class="quantity">
										<view><image v-show="itemgood.quantity > 0" src="/static/tab/jianhao.png" mode="widthFix" @click="reduce(index,good_index,item.cid,itemgood)"></image></view>
										<view>
											<text v-show="itemgood.quantity > 0">{{ itemgood.quantity }}</text>
										</view>
										<view><image src="/static/tab/jia.png" mode="widthFix" @click="plus(index,good_index,item.cid,itemgood)"></image></view>
									</view>
								</view>
							</view>
						</block>

						<view style="height: 400rpx;"></view>
					</scroll-view>
				</view>
			</view>
		</view>
		<!-- 底部 -->
		<view class="order-bottom" @click="pop_Shopping()">
			<view class="Shopping" style="width: 115rpx;">
				<view class="Shopping-left"><image src="/static/tab/gouwuche.png" mode="widthFix"></image></view>
				<view class="Shopping-number">12</view>
			</view>
			<view class="Shopping-title">已点10份菜品</view>
			<view class="place-order"><button plain="true" open-type="getUserInfo">选好了</button></view>
		</view>
		<!-- 购物车 -->
		<!-- 通过数据绑定的方式传给子组件 -->
		<Cart v-if="card" :shopping_card="shopping_card"></Cart>
	</view>
</template>

<script>
	// 小程序端一次性只能返回20条数据，云函数端100条；外部node.js，java返回10条
	// 引入购物车子组件
	import Cart from './components/shopping-cart.vue'
export default {
	components:{Cart},
	data() {
		return {
			itemize: [], //类目
			trigger: 0, //点击类目  给类目背景加上背景白色  类目选中值
			goods: [], //所有菜品
			heightset: [], //存储右边每一个分类菜谱的高度
			tophei: 0, //滚动时距离顶部的高度
			scroll_into:'',
			card:false,//购物车隐藏
			shopping_card:[],//购物车里的数据
		};
	},
	methods: {
		// 添加进购物车里的商品
		shopping_Cart(arr){
			// console.log(arr);
			// 一.购物车里没有数据 空数组：直接添加进数据
			// 二.购物车里有数据 
				//1.有没有相同的菜品存在
				//2.有相同的菜品存在
				if(this.shopping_card.length ==0){
					this.shopping_card.push(arr)
					// console.log(this.shopping_card);
				}else{
					// console.log(this.shopping_card);
					// 购物车里有数据
					let itemindex = this.shopping_card.findIndex(item=>{
						return item._id == arr._id
					})
					// console.log(itemindex);
					if(itemindex ==-1){
						//没有相同的商品存在
						this.shopping_card.unshift(arr)
					}else{
						this.$set(this.shopping_card[itemindex],'quantity',arr.quantity)
						this.$set(this.shopping_card[itemindex],'total_price',arr.total_price)
					}
					
				}
			
		},
		// 显示购物车组件
		pop_Shopping(value = true){
			this.card =value
		},
		// 单个商品-
		reduce(index,good_index,cid,itemgood){
			let {quantity,image,name,unitprice,unit,_id} = itemgood
			// console.log(index+'----------'+good_index);
			const QU = quantity -1
			this.$set(this.goods[index].good_query[good_index],'quantity',QU)
			const arr = {image,name,unitprice,quantity:QU,unit,total_price:unitprice*QU,_id,cid,good_index}
			this.shopping_Cart(arr)
		},
		//单个商品+
		plus(index,good_index,cid,itemgood){
			let {quantity,image,name,unitprice,unit,_id} = itemgood
			// console.log(index+'----------'+good_index);
			const QU = quantity +1
			this.$set(this.goods[index].good_query[good_index],'quantity',QU)
			const arr = {image,name,unitprice,quantity:QU,unit,total_price:unitprice*QU,_id,cid,good_index}
			this.shopping_Cart(arr)
		},
		
		// 计算 右边每个菜品的分类的高度
		goods_height() {
			let cate_height = 0;
			const query = wx.createSelectorQuery();
			query.selectAll('.rig-height').boundingClientRect();
			query.exec(res => {
				// console.log(res);
				res[0].forEach(item => {
					cate_height += item.height;
					this.heightset.push(cate_height);
				});
			});
		},
		// 右边菜谱滚动式触发
		scroLl(event) {
			// console.log(event.detail.scrollTop);
			let scrollTop = event.detail.scrollTop;
			if (scrollTop >= this.tophei) {
				//上拉
				// 当前分类商品的高度小于滚动高度时跳转到下一个分类
				if (scrollTop >= this.heightset[this.trigger]) {
					this.trigger +=1
				}
			} else {				
				//下拉
				// 当前分类商品的高度大于滚动的高度时跳转到下一个分类
				if(scrollTop <this.heightset[this.trigger-1])
				this.trigger -=1
			}
			this.tophei = scrollTop;
		},
		// 点击类目加上背景色
		itemIze(index,cid) {
			this.trigger = index;
			this.scroll_into = cid
			setTimeout(()=>{
				this.scroll_into = ''
			},200)
		},
		// 请求数据
		async dishEs() {
			// 请求云函数 获取菜品分类信息
			const res = await wx.cloud.callFunction({ name: 'Dish-manage', data: {} });
			console.log(res);
			this.itemize = res.result.res_cate; // 类目
			console.log('菜品目录:', this.itemize);
			this.goods = res.result.res_dis; // 所有菜品
			console.log('所有菜品:', this.goods);
			this.scroll_into='a1642912937106';
			this.$nextTick(() => {
				this.goods_height();
			});
		}
	},
	onLoad() {
		this.dishEs();
	}
};
</script>

<style scoped lang="scss">
// 顶部的设置
.top-view {
	/* 背景颜色使用线性坡度 从上向下颜色递进 */
	background: linear-gradient(to bottom, #f7d45f, #f7d562, #f8d561, #f9db76, #f9de80);
	height: 120rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 20rpx;
	position: fixed;
	top: 0;
	right: 0;
	left: 0;

	.top-view-flex {
		display: flex;
		align-items: center;
		image {
			&.top-search {
				padding-right: 50rpx;
			}
			display: block;
			width: 35rpx;
			height: 35rpx;
		}
	}
}
/* 点餐界面 */
.order-view {
	margin-top: 120rpx;
}
.commodity {
	display: flex;
	position: fixed;
	top: 120rpx;
	left: 0;
	right: 0;
}
.order-left {
	background-color: #fafafa;
	width: 150rpx;
	overflow-y: auto;
}
.itemize-text {
	font-size: 27rpx;
	padding: 30rpx 10rpx;
	display: flex;
	align-items: center;
	color: #797979;
}
.itemize-text text:nth-child(1) {
	flex: 1;
}
.itemize-text text:nth-child(2) {
	background-color: #eb5941;
	border-radius: 50%;
	font-size: 20rpx;
	color: #ffffff;
	width: 30rpx;
	height: 30rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-left: 2rpx;
}
.scroll-Hei {
	height: 100vh;
	/* white-space: nowrap; */
}
.order-right {
	background-color: #ffffff;
	flex: 1;
	overflow-y: auto;
}
.classif {
	font-size: 27rpx;
	padding: 30rpx 20rpx;
	color: #797979;
}
/* 分类商品 */
.classif-goods {
	display: flex;
	justify-content: space-between;
	padding: 0 20rpx;
	height: 150rpx;
	font-size: 30rpx;
	margin-bottom: 45rpx;
}

.goods-image image {
	display: block;
	width: 150rpx;
	height: 150rpx;
	border-radius: 10rpx;
}
.goods-Price {
	flex: 1;
	position: relative;
	padding: 0 20rpx;
}
.goods-Price text {
	display: block;
}
.goods-name {
	display: flex;
	flex-direction: column;
	position: relative;
	top: 0;
}
.goods-name text:nth-child(1) {
	padding-bottom: 9rpx;
}
.unit-price {
	position: absolute;
	bottom: 0;
	display: flex;
	align-items: baseline;
}
.Bold {
	font-weight: bold;
}
.Symbol {
	font-size: 20rpx;
}
.Thinning {
	font-size: 25rpx;
	color: #cccccc;
}
.quantity image {
	width: 50rpx;
	height: 50rpx;
}
.quantity view {
	width: 50rpx;
	height: 50rpx;
	text-align: center;
	line-height: 50rpx;
}
.quantity {
	display: flex;
	align-items: center;
	align-self: flex-end;
	width: 200rpx;
	justify-content: space-between;
}
.order-bottom {
	background-color: #fefefe;
	height: 120rpx;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	box-shadow: 0rpx -1.9rpx 1rpx 1rpx #f9f9f9;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 20rpx;
	z-index: 9;
}
.Shopping image {
	width: 75rpx;
	height: 75rpx;
	display: block;
}
.Shopping-left {
	width: 75rpx;
	height: 75rpx;
}
.Shopping {
	display: flex;
	align-items: center;
	/* height: 120rpx; */
}
.Shopping-number {
	align-self: flex-start;
	background: #eb5941;
	color: #ffff;
	width: 40rpx;
	border-radius: 50rpx;
	text-align: center;
	font-size: 20rpx;
	/* margin-top: 15rpx; */
}
.Shopping-title {
	flex: 1;
	padding: 0 25rpx;
	color: #999999;
	/* height: 120rpx;
	line-height: 120rpx; */
}
.place-order button {
	border: none;
	background: linear-gradient(to right, #f8da81, #f8d771, #f7d362, #f6cb4a);
	width: 200rpx;
	height: 75rpx;
	line-height: 75rpx;
	border-radius: 50rpx;
	font-weight: bold;
	z-index: 9;
}
/* 点击分类列表加上背景色 */
.active {
	background-color: #ffffff;
	color: #000000 !important;
}
</style>
