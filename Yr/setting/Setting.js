define([
  'dojo/_base/declare',
  'jimu/BaseWidgetSetting',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dijit/_WidgetsInTemplateMixin',
  'jimu/LayerInfos/LayerInfos',
  'dijit/form/Select'
],
function(declare, BaseWidgetSetting, lang, array, _WidgetsInTemplateMixin, LayerInfos) {
  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    baseClass: 'jimu-widget-yr-setting',
    setConfig: function(config){
      // Update config
      this.customProxyURLNode.value = config.customProxyURL;
      this.yrPolygonerURLNode.value = config.yrPolygonerURL;
    },
    getConfig: function(){
      //WAB will get config object through this method
      return {
        customProxyURL: this.customProxyURLNode.value,
        yrPolygonerURL: this.yrPolygonerURLNode.value
      };
    }
  });
});