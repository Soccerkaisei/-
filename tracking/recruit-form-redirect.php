add_action('wp_footer', function () { ?>
<script>
(function () {
  var OLD = 'docs.google.com/forms/d/e/1FAIpQLSdjnGqCh4U73mV-oIOOq3TEwNol-k99qJiUEE9pjtxrgKSoDg';
  var NEW = 'https://studio.nijin.app/recruit/apply';
  var lang = (location.pathname.split('/')[1] || 'ja');
  document.querySelectorAll('a[href*="' + OLD + '"]').forEach(function (a) {
    a.href = NEW + '?utm_source=nijin.co.jp&utm_medium=recruit_page_' + lang + '&utm_campaign=recruit-home';
  });
})();
</script>
<?php });
