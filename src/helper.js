/* eslint-disable no-console */
define(["qlik"], function (qlik) {
  return {
    getMasterItems: function () {
      var app = qlik.currApp(this);
      return new Promise(function (resolve, reject) {
        app.getList('masterobject').then(function (model) {
          // Close the model to prevent any updates.
          app.destroySessionObject(model.layout.qInfo.qId);
          // This is a bit iffy, might be smarter to reject and handle empty lists on the
          // props instead.
          let supportedMasterItems = model.layout.qAppObjectList.qItems.filter(function (item) {
            return item.qData.visualization == 'table';
          });

          if (!supportedMasterItems || supportedMasterItems.length === 0) {
            return resolve([{ value: '', label: 'No MasterObjects', visualization: '' }]);
          }

          supportedMasterItems.sort(function (item1, item2) {
            return item1.qMeta.title < item2.qMeta.title ? -1 : 1;
          });

          // Resolve an array with master objects.
          return resolve(supportedMasterItems.map(function (item) {
            return {
              value: item.qInfo.qId,
              label: item.qMeta.title,
              visualization: item.qData.visualization
            };
          }));
        });
      });
    }


  };
});
