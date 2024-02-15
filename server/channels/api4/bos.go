package api4

//import
import (
	"encoding/json"
	"fmt"
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/v8/channels/audit"
	"net/http"
)

func (api *API) InitBos() {
	api.BaseRoutes.Bos.Handle("/login", api.APIHandler(getprofile)).Methods("GET", "POST")
}
func getprofile(c *Context, w http.ResponseWriter, r *http.Request) {
	props := model.MapFromJSON(r.Body)
	fmt.Println("UserProfileURL")
	fmt.Println(c.App.Config().ServiceSettings.UserProfileUrl)
	fmt.Println("PROPS LoadProfile")
	fmt.Println(props)
	id := props["id"]
	token := props["token"]
	deviceId := props["device_id"]
	auditRec := c.MakeAuditRecord("login", audit.Fail)

	auditRec.AddMeta("device_id", deviceId)

	c.LogAuditWithUserId(id, "attempt - login_id="+token)
	user, err := c.LoadProfile(token)
	fmt.Println(user)
	if err != nil {
		c.LogAuditWithUserId(id, "failure - login_id="+token)
		c.Err = err
		return
	}

	_, err = c.App.DoLogin(c.AppContext, w, r, user, deviceId, false, false, false)
	if err != nil {
		c.Err = err
		return
	}

	c.LogAuditWithUserId(user.Id, "success")

	if r.Header.Get(model.HeaderRequestedWith) == model.HeaderRequestedWithXML {
		c.App.AttachSessionCookies(c.AppContext, w, r)
	}

	user.Sanitize(map[string]bool{})
	auditRec.Success()

	users, errs := json.Marshal(user)
	if errs != nil {
		fmt.Println(errs)
		return
	}
	fmt.Println("HERE I GOOO--")
	fmt.Println(string(users))

	// ReturnStatusOK(w)
	w.Write([]byte(users))
}
