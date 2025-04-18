define(function () {
  return {
    workflowApiVersion: "1.1",
    metaData: {
      icon: "https://2-nitzap-activity.vercel.app/nitzap_icon.png",
      category: "message"
    },
    type: "REST",
    lang: {
      "en-US": {
        name: "2-Nitzap Activity",
        description: "Sends a WhatsApp message using the Nitzap API"
      }
    },
    configurationArguments: {
      applicationExtensionKey: "68b12e7b-721b-4fa7-9c6f-741266623b5d",
      publish: {
        url: "https://2-nitzap-activity.vercel.app/publish.html"
      },
      validate: {
        url: "https://2-nitzap-activity.vercel.app/validate.html"
      },
      stop: {
        url: "https://2-nitzap-activity.vercel.app/stop.html"
      }
    },
    userInterfaces: {
      configModal: {
        url: "https://2-nitzap-activity.vercel.app/config.html",
        height: 500,
        width: 600
      },
      edit: {
        url: "https://2-nitzap-activity.vercel.app/config.html",
        height: 500,
        width: 600
      }
    },
    schema: {
      arguments: {
        execute: {
          inArguments: [
            {
              contactKey: "{{Contact.Key}}"
            }
          ],
          outArguments: [],
          url: "https://2-nitzap-activity.vercel.app/api/execute",
          verb: "POST",
          body: "",
          header: "",
          format: "json",
          useJwt: false
        }
      }
    }
  };
});
