package ge.spilo.app

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import ge.spilo.app.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null

    // Register file chooser activity result
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val data = result.data
            val uris = when {
                data?.clipData != null -> {
                    val count = data.clipData!!.itemCount
                    Array(count) { i -> data.clipData!!.getItemAt(i).uri }
                }
                data?.data != null -> {
                    arrayOf(data.data!!)
                }
                else -> null
            }
            fileChooserCallback?.onReceiveValue(uris)
        } else {
            fileChooserCallback?.onReceiveValue(null)
        }
        fileChooserCallback = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        // Switch from Splash theme to default Theme
        setTheme(R.style.Theme_Spilo)
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupBackPressHandler()
        setupSwipeRefresh()
        setupOfflineRetry()
        setupWebView()

        val startUrl = getString(R.string.web_url)
        if (isNetworkAvailable()) {
            binding.webView.loadUrl(startUrl)
        } else {
            showOfflineView()
        }
    }

    private fun setupBackPressHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.offlineLayout.visibility == View.VISIBLE) {
                    if (binding.webView.canGoBack()) {
                        hideOfflineView()
                        binding.webView.goBack()
                    } else {
                        finish()
                    }
                } else if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefreshLayout.setColorSchemeResources(R.color.brand_orange)
        binding.swipeRefreshLayout.setOnRefreshListener {
            if (isNetworkAvailable()) {
                hideOfflineView()
                binding.webView.reload()
            } else {
                binding.swipeRefreshLayout.isRefreshing = false
                showOfflineView()
            }
        }

        // Only allow swipe to refresh when at the very top of the webpage
        binding.webView.viewTreeObserver.addOnScrollChangedListener {
            binding.swipeRefreshLayout.isEnabled = (binding.webView.scrollY == 0)
        }
    }

    private fun setupOfflineRetry() {
        binding.btnRetry.setOnClickListener {
            if (isNetworkAvailable()) {
                hideOfflineView()
                val currentUrl = binding.webView.url ?: getString(R.string.web_url)
                binding.webView.loadUrl(currentUrl)
            } else {
                Toast.makeText(this, R.string.offline_title, Toast.LENGTH_SHORT).show()
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val webSettings = binding.webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.databaseEnabled = true
        webSettings.useWideViewPort = true
        webSettings.loadWithOverviewMode = true
        webSettings.builtInZoomControls = false
        webSettings.displayZoomControls = false
        webSettings.setSupportZoom(false)
        webSettings.allowFileAccess = true
        webSettings.allowContentAccess = true
        webSettings.mediaPlaybackRequiresUserGesture = false

        // Cache mode
        webSettings.cacheMode = if (isNetworkAvailable()) {
            WebSettings.LOAD_DEFAULT
        } else {
            WebSettings.LOAD_CACHE_ELSE_NETWORK
        }

        // Mixed content (support secure HTTPS with resources)
        webSettings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE

        // Enable Cookies
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(binding.webView, true)

        // WebChromeClient for Loading Progress & File Picking
        binding.webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    binding.progressBar.visibility = View.VISIBLE
                    binding.progressBar.progress = newProgress
                } else {
                    binding.progressBar.visibility = View.GONE
                    binding.swipeRefreshLayout.isRefreshing = false
                }
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileChooserCallback?.onReceiveValue(null)
                fileChooserCallback = filePathCallback

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }

                try {
                    filePickerLauncher.launch(intent)
                } catch (e: Exception) {
                    fileChooserCallback = null
                    Toast.makeText(this@MainActivity, "Failed to open file picker", Toast.LENGTH_SHORT).show()
                    return false
                }
                return true
            }
        }

        // WebViewClient for Navigation & Error Handling
        binding.webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                binding.progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                binding.progressBar.visibility = View.GONE
                binding.swipeRefreshLayout.isRefreshing = false
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    if (!isNetworkAvailable()) {
                        showOfflineView()
                    }
                }
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val uri = request?.url ?: return false
                val url = uri.toString()

                // Internal app domains stay inside the WebView
                val host = uri.host
                if (host != null && (host.contains("animeb.ge") || host.contains("spilo.ge") || host == "localhost")) {
                    return false
                }

                // External intents: tel, mailto, whatsapp, maps, market
                if (url.startsWith("tel:") ||
                    url.startsWith("mailto:") ||
                    url.startsWith("whatsapp:") ||
                    url.startsWith("viber:") ||
                    url.startsWith("market:")
                ) {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, uri)
                        startActivity(intent)
                        return true
                    } catch (e: Exception) {
                        Toast.makeText(this@MainActivity, "Application not found", Toast.LENGTH_SHORT).show()
                        return true
                    }
                }

                // Default external URLs open in browser
                try {
                    val browserIntent = Intent(Intent.ACTION_VIEW, uri)
                    startActivity(browserIntent)
                    return true
                } catch (e: Exception) {
                    return false
                }
            }
        }
    }

    private fun showOfflineView() {
        binding.offlineLayout.visibility = View.VISIBLE
        binding.swipeRefreshLayout.visibility = View.GONE
        binding.progressBar.visibility = View.GONE
        binding.swipeRefreshLayout.isRefreshing = false
    }

    private fun hideOfflineView() {
        binding.offlineLayout.visibility = View.GONE
        binding.swipeRefreshLayout.visibility = View.VISIBLE
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    override fun onResume() {
        super.onResume()
        binding.webView.onResume()
    }

    override fun onPause() {
        super.onPause()
        binding.webView.onPause()
    }

    override fun onDestroy() {
        binding.webView.destroy()
        super.onDestroy()
    }
}
