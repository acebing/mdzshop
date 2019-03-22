
	$.levelLink();//地区三级联动
	/*添加管辖地区*/
	$("a[ectype='addPrivilege']").on("click",function(){
		var selProvince = $('#selProvinces');
		var selCity     = $('#selCities');
		var selDistrict = $('#selDistricts');
		var regionCell  = $('#regionCell');
		var regionId = 0;
		var regionName = '';

		var tid = $("#tab_tid").val();
		var shipping_id = $("#tab_shipping_id").val();

		if (selDistrict.val() > 0)
		{
			regionId = selDistrict.val();
			regionName = selDistrict.next(".txt").text();
		}else{
			if(selCity.val() > 0){
				regionId = selCity.val();
				regionName = selCity.next(".txt").text();
			}else{
				if(selProvince.val() > 0){
					regionId = selProvince.val();
					regionName = selProvince.next(".txt").text();
				}else{
					the_national(tid, shipping_id)
					return false;
				}
			}
		}

		//检查该地区是否已经存在
		exists = false;
		$('input:checkbox[type="checkbox"]').each(function()
		{
			if($(this).attr("name") == 'regions[]'){
				if($(this).val()  == regionId){
					exists = true;
					return false;
				}
			}
		});

		//检查该地区是否已经存在运费模板 start
		var area_erorr = 0;
		regionId = Number(regionId);
		if(regionId > 0){
			$.ajax({
				type:"get",
				url:"goods_transport.php?act=select_area",
				data:'tid=' + tid + "&shipping_id=" + shipping_id + "&region_id=" + regionId,
				dataType: 'json',
				async : false, //设置为同步操作就可以给全局变量赋值成功
				success:function(result){
					area_erorr = result.error;
				}
			});
		}

		if(area_erorr == 1){
			exists = true;
		}
		//检查该地区是否已经存在运费模板 end

		//创建checkbox
		if (exists == false)
		{
		  regionCell.append('<div class="checkbox_item"><input type="checkbox" value="'+regionId+'" name="regions[]" class="ui-checkbox" id="region_'+regionId+'" checked="true" /><label for="region_'+regionId+'" class="ui-label">'+regionName+'</label></div>');
		}else{
			alert(jl_this_area_existed);
		}
	});

	$("input[name='deleteArea']").click(function(){
		if($(this).prop("checked") == true){
			$("#regionCell").find("input[type='checkbox']").prop("checked",true);
		}else{
			$("#regionCell").find("input[type='checkbox']").prop("checked",false);
		}
	});

	//配送费用计算方式
	function compute_mode(shipping_code,mode)
	{
		var base_fee  = $("#base_fee");
		var step_fee  = $("#step_fee");
		var item_fee  = $("#item_fee");
		if(shipping_code == 'post_mail' || shipping_code == 'post_express')
		{
		 var step_fee1  = $("#step_fee1");
		}

		if(mode == 'number')
		{
		  item_fee.css('display','');
		  base_fee.css('display','none');
		  step_fee.css('display','none');
		  if(shipping_code == 'post_mail' || shipping_code == 'post_express')
		  {
			  step_fee1.css('display','none');
		  }
		}
		else
		{
			item_fee.css('display','none');
			base_fee.css('display','');
			step_fee.css('display','');
		  if(shipping_code == 'post_mail' || shipping_code == 'post_express')
		  {
			  step_fee1.css('display','');
		  }
		}
	}

  	$(function(){
  		var freight_type = Number("1");
  		var shipping_id = Number("0");
  		var tid = Number($("input[name='tid']").val());

  		//表单验证
  		$("#submitBtn").click(function(){
  			if($("#goods_transport_form").valid()){
  				$("#goods_transport_form").submit();
  			}
  		});

  		$('#goods_transport_form').validate({
  			errorPlacement:function(error, element){
  				var error_div = element.parents('div.label_value').find('div.form_prompt');
  				element.parents('div.label_value').find(".notic").hide();
  				error_div.append(error);
  			},
  			rules:{
  				title :{
  					required : true
  				}
  			},
  			messages:{
  				title:{
  					required : '<i class="icon icon-exclamation-sign"></i>' + goods_transport_not_null
  				}
  			}
  		});
  	});

  	//运费模板
  	function freightTemplate(){
  		var doc = $(document),
  			tid = $("input[name='tid']").val();
  			id = 0;
  		/***************************模板类型 -> 快递模板*************************/
  		//选择配送方式
  		$.divselect("#shipping_id","#shipping_id_val",function(obj){
  			var val = obj.data("value"),
  				name  = obj.html();

  			dialog_shipping(val, id);
  		});

  		//编辑运费模板内的快递
  		doc.on("click","*[ectype='edit_shipping']",function(){
  			var val = $(this).parents('tr').data('shipping_id');
  			var id = $(this).data('id');
  			dialog_shipping(val, id);
  		});

  		//删除运费模板内的快递
  		doc.on("click","*[ectype='drop_shipping']",function(){
  			var t = $(this),
  			 	id = t.data('id');

  			if(confirm(confirm_delete_transport)){
  				$.jqueryAjax('goods_transport.php', 'act=drop_shipping&tid='+tid + "&id=" + id, function(data){
  					$("#transport_tpl").html(data.content);
  				});
  			}
  		});

  		//添加地区
  		doc.on("click","*[ectype='add_shipping_area']",function(){
  			var val = $(this).parents('tr').data('shipping_id');
  			dialog_shipping(val, id);
  		});

  		/***************************模板类型 -> 自定义 *************************/
  		//添加地区
  		doc.on("click","*[ectype='add_area']",function(){
  			$.jqueryAjax('goods_transport.php', 'act=add_area&tid='+tid, function(data){
  				$("*[ectype='transportArea']").html(data.content);
  			});
  		});

  		//编辑地区
  		doc.on("click","*[ectype='edit_area']",function(){
  			var id = $(this).parents('tr').find('input[name=id]').val();
  			$.jqueryAjax('goods_transport.php', 'act=edit_area&id='+id, function(data){
  				var content = data.content;
  				pb({
  					id:"area_dialog",
  					title:"选择地区",
  					width:900,
  					content:content,
  					ok_title:"确定",
  					cl_title:"取消",
  					drag:false,
  					foot:true,
  					cl_cBtn:true,
  					onOk:function(){save_area();}
  				});
  			})
  		});

  		//删除地区
  		doc.on("click","*[ectype='drop_area']",function(){
  			var id = $(this).parents('tr').find('input[name=id]').val();
  			$.jqueryAjax('goods_transport.php', 'act=drop_area&id='+id, function(data){
  				$("*[ectype='transportArea']").html(data.content);
  			});
  		});

  		//展开地区二级
  		doc.on("click",".area-province i", function(){
  			var area_city = $(this).siblings(".area-city");
  			if(area_city.hasClass("hide")){
  				$(this).parents(".area-province").find(".area-city").addClass("hide");
  				area_city.removeClass("hide");
  				$(this).removeClass("icon-angle-down").addClass("icon-angle-up");
  			}else{
  				area_city.addClass("hide");
  				$(this).removeClass("icon-angle-up").addClass("icon-angle-down");
  			}
  		});

  		//选中省份
  		doc.on("click","input[name=province]", function(){
  			if($(this).prop('checked')){
  				$(this).parents('li:first').find('ul.area-city input:enabled').prop('checked', true);
  			}else{
  				$(this).parents('li:first').find('ul.area-city input:enabled').prop('checked', false);
  			}
  			var child_num = $(this).parents('li:first').find('ul.area-city input:enabled:checked').length;
  			var child_obj = $(this).siblings(".ui-label").find('[data-role=child_num]');
  			change_child_num(child_obj, child_num);
  		});

  		//选中城市
  		doc.on("click","input[name=city]", function(){
  			var child_num = $(this).parents('ul.area-city').find('input:enabled:checked').length;
  			var child_obj = $(this).parents('.area-city').siblings(".ui-label").find('[data-role=child_num]');
  			change_child_num(child_obj, child_num);
  		});

  		//添加快递
  		doc.on("click","*[ectype='add_express']", function(){
  			var tid = $("input[name='tid']").val();
  			$.jqueryAjax('goods_transport.php', 'act=add_express&tid='+tid, function(data){
  				$("[ectype='transportExpress']").html(data.content);
  			})
  		});

  		//删除快递
  		doc.on("click","*[ectype='drop_express']", function(){
  			var id = $(this).parents('tr').find('input[name=id]').val();
  			$.jqueryAjax('goods_transport.php', 'act=drop_express&id='+id, function(data){
  				$("[ectype='transportExpress']").html(data.content);
  			})
  		});

  		//编辑快递
  		doc.on("click","*[ectype='edit_express']", function(){
  			var id = $(this).parents('tr').find('input[name=id]').val();
  			$.jqueryAjax('goods_transport.php', 'act=edit_express&id='+id, function(data){
  				var content = data.content;
  				pb({
  					id:"express_dialog",
  					title:"选择快递",
  					width:900,
  					content:content,
  					ok_title:"确定",
  					cl_title:"取消",
  					drag:false,
  					foot:true,
  					cl_cBtn:true,
  					onOk:function(){save_express();}
  				});
  			})
  		});

  		//全选地区
  		doc.on("click","input[name=all]",function(){
  			if($(this).prop('checked')){
  				$(this).parents('.area-province,.transport-express').find('input[type=checkbox]').prop('checked', true);
  			}else{
  				$(this).parents('.area-province,.transport-express').find('input[type=checkbox]').prop('checked', false);
  			}
  		});

  		//点击空白处
  		doc.click(function(e){
  			if(e.target.className != "area-city" && !$(e.target).parents("ul").is(".area-city") && e.target.className != "icon icon-angle-up"){
  				$(".area-city").addClass("hide");
  				$(".area-province").find("i").removeClass("icon-angle-up").addClass("icon-angle-down");
  			}
  		});

  		/*************************************方法**********************************/
  		//快递模板类型切换
  		check_type = function(type){
  			if(type == 0){
  				$("#Template_freight").hide();
  				$("#Fixed_freight").show();
  			}else{
  				$("#Template_freight").show();
  				$("#Fixed_freight").hide();
  			}
  		}

  		//统计数量
  		change_child_num = function(obj, num){
  			obj.html(obj.html().replace(/\d+/, num));
  			if(num > 0){
  				obj.removeClass('hide');
  				obj.parents('.ui-label').siblings('input[name=province]').prop('checked', true);
  			}else{
  				obj.addClass('hide');
  				obj.parents('.ui-label').siblings('input[name=province]').prop('checked', false);
  			}
  		}

  		//自定义编辑配送区域保存
  		save_area = function(){
  			var id = $('.area-province').data('id');
  			var province = new Array();
  			var city = new Array();
  			//省份
  			$('.area-province').find("input[name=province]:enabled:checked").each(function(){
  				province.push($(this).val());
  			})
  			//城市
  			$('.area-province').find("input[name=city]:enabled:checked").each(function(){
  				city.push($(this).val());
  			})
  			province = province.join(',');
  			city = city.join(',');
  			$.jqueryAjax('goods_transport.php', 'act=save_area&id='+id+'&top_area_id='+province+'&area_id='+city, function(data){
  				$("*[ectype='transportArea']").html(data.content);
  			});
  		}

  		//自定义模式编辑快递方式保存
  		save_express = function(){
  			var id = $('.transport-express').data('id');
  			var express = new Array();
  			$('.transport-express').find("input[name=shipping]:enabled:checked").each(function(){
  				express.push($(this).val());
  			})
  			express = express.join(',');
  			$.jqueryAjax('goods_transport.php', 'act=save_express&id='+id+'&shipping_id='+express, function(data){
  				$("[ectype='transportExpress']").html(data.content);
  			});
  		}

  		//快递模板 运费模板编辑
  		dialog_shipping = function(val, id){
  			$.jqueryAjax('goods_transport.php', 'act=get_shipping_tem&shipping_id='+val + "&id=" + id + "&tid=" + tid, function(data){
  				var content = data.content;
  				pb({
  					id:"area_dialog",
  					title:"编辑运费模板",
  					width:900,
  					content:content,
  					ok_title:"确定",
  					cl_title:"取消",
  					drag:true,
  					foot:true,
  					cl_cBtn:true,
  					onOk:function(){
  						var actionUrl = "goods_transport.php?act=add_shipping_tpl";
  						$("form[name='shipping_tplForm']").ajaxSubmit({
  							type: "POST",
  							dataType: "JSON",
  							url: actionUrl,
  							data: {"action": "TemporaryImage"},
  							success: function (data) {
  								$("#transport_tpl").html(data.content);
  								$(".tpl_region").perfectScrollbar("destroy");
  								$(".tpl_region").perfectScrollbar();
  							},
  							async: true
  						});
  					}
  				});
  			});
  		}

  		$(".tpl_region").perfectScrollbar("destroy");
  		$(".tpl_region").perfectScrollbar();
  	}
  	freightTemplate();
