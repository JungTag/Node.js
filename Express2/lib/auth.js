module.exports = {
    isOwner:function(req, res) {
        if(req.user) {
          return true;
        } else {
          return false;
        }
      },
    statusUi:function(req, res) {
        let authStatusUi = '<a href="/auth/login">login</a>'
        if (this.isOwner(req, res)) {
          authStatusUi = `${req.user.nickname} | <a href="/auth/logout">logout</a>`;
        }
        return authStatusUi;
      }
}