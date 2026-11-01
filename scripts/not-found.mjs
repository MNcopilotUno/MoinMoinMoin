// GitHub Pages has no route for Moin Domi links (`<base>domi/m/<id>#<key>`, D11): it serves the
// site's 404.html. This page turns such a path into `<base>domi/?m=<id>#<key>`; the fragment (the
// key) stays in the browser, as fragments always do. Any other missing page goes to the puzzle.
export function notFoundPage(base = '/') {
  const root = JSON.stringify(base);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<title>Moin</title>
<style>html{background:#000;color:#f6efdf;font-family:system-ui,sans-serif}body{margin:0;min-height:100vh;display:grid;place-items:center}a{color:#f6efdf}</style>
<script>
  (function () {
    var m = /^(.*\\/domi\\/)m\\/([A-Za-z0-9_-]{1,64})\\/?$/.exec(location.pathname);
    location.replace(m ? m[1] + '?m=' + m[2] + location.hash : ${root});
  })();
</script>
</head>
<body><p><a href=${root}>Moin</a></p></body>
</html>
`;
}
