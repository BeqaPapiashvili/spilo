import UIKit
import WebKit
import Network

class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {

    // MARK: - Properties
    private var webView: WKWebView!
    private var progressView: UIProgressView!
    private var refreshControl: UIRefreshControl!
    private var offlineView: UIView!
    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "NetworkMonitor")
    private var isConnected: Bool = true
    private var estimatedProgressObservation: NSKeyValueObservation?

    private let targetURL = URL(string: "https://v3.animeb.ge")!

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        overrideUserInterfaceStyle = .light

        setupWebView()
        setupProgressView()
        setupRefreshControl()
        setupOfflineView()
        setupNetworkMonitor()

        loadMainURL()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        // Ensure webView respects top/bottom Safe Area if needed
    }

    // MARK: - Setup UI
    private func setupWebView() {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true

        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.bounces = true
        webView.scrollView.alwaysBounceVertical = true

        view.addSubview(webView)

        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])

        // Track loading progress
        estimatedProgressObservation = webView.observe(\.estimatedProgress, options: [.new]) { [weak self] (webView, _) in
            guard let self = self else { return }
            self.progressView.progress = Float(webView.estimatedProgress)
            if webView.estimatedProgress >= 1.0 {
                UIView.animate(withDuration: 0.3, delay: 0.1, options: .curveEaseOut, animations: {
                    self.progressView.alpha = 0
                }) { _ in
                    self.progressView.progress = 0
                }
            } else {
                self.progressView.alpha = 1
            }
        }
    }

    private func setupProgressView() {
        progressView = UIProgressView(progressViewStyle: .bar)
        progressView.translatesAutoresizingMaskIntoConstraints = false
        progressView.progressTintColor = UIColor(red: 1.0, green: 0.32, blue: 0.22, alpha: 1.0) // #FF5238
        progressView.trackTintColor = .clear
        progressView.alpha = 0

        view.addSubview(progressView)

        NSLayoutConstraint.activate([
            progressView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            progressView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            progressView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            progressView.heightAnchor.constraint(equalToConstant: 2.5)
        ])
    }

    private func setupRefreshControl() {
        refreshControl = UIRefreshControl()
        refreshControl.tintColor = UIColor(red: 1.0, green: 0.32, blue: 0.22, alpha: 1.0)
        refreshControl.addTarget(self, action: #selector(handleRefresh), for: .valueChanged)
        webView.scrollView.refreshControl = refreshControl
    }

    @objc private func handleRefresh() {
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()

        if isConnected {
            hideOffline()
            webView.reload()
        } else {
            refreshControl.endRefreshing()
            showOffline()
        }
    }

    private func setupOfflineView() {
        offlineView = UIView()
        offlineView.translatesAutoresizingMaskIntoConstraints = false
        offlineView.backgroundColor = .white
        offlineView.isHidden = true

        let iconImageView = UIImageView()
        iconImageView.translatesAutoresizingMaskIntoConstraints = false
        iconImageView.image = UIImage(systemName: "wifi.slash")
        iconImageView.tintColor = UIColor(red: 1.0, green: 0.32, blue: 0.22, alpha: 1.0)
        iconImageView.contentMode = .scaleAspectFit

        let titleLabel = UILabel()
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        titleLabel.text = "ინტერნეტი არ არის"
        titleLabel.font = UIFont.systemFont(ofSize: 20, weight: .regular)
        titleLabel.textColor = UIColor(red: 0.11, green: 0.11, blue: 0.12, alpha: 1.0)
        titleLabel.textAlignment = .center

        let messageLabel = UILabel()
        messageLabel.translatesAutoresizingMaskIntoConstraints = false
        messageLabel.text = "გთხოვთ შეამოწმოთ ინტერნეტთან კავშირი და სცადოთ თავიდან."
        messageLabel.font = UIFont.systemFont(ofSize: 14, weight: .regular)
        messageLabel.textColor = .secondaryLabel
        messageLabel.textAlignment = .center
        messageLabel.numberOfLines = 0

        let retryButton = UIButton(type: .system)
        retryButton.translatesAutoresizingMaskIntoConstraints = false
        retryButton.setTitle("თავიდან ცდა", for: .normal)
        retryButton.setTitleColor(.white, for: .normal)
        retryButton.backgroundColor = UIColor(red: 1.0, green: 0.32, blue: 0.22, alpha: 1.0)
        retryButton.layer.cornerRadius = 12
        retryButton.titleLabel?.font = UIFont.systemFont(ofSize: 15, weight: .regular)
        retryButton.addTarget(self, action: #selector(retryTapped), for: .touchUpInside)

        offlineView.addSubview(iconImageView)
        offlineView.addSubview(titleLabel)
        offlineView.addSubview(messageLabel)
        offlineView.addSubview(retryButton)

        view.addSubview(offlineView)

        NSLayoutConstraint.activate([
            offlineView.topAnchor.constraint(equalTo: view.topAnchor),
            offlineView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            offlineView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            offlineView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            iconImageView.centerXAnchor.constraint(equalTo: offlineView.centerXAnchor),
            iconImageView.centerYAnchor.constraint(equalTo: offlineView.centerYAnchor, constant: -80),
            iconImageView.widthAnchor.constraint(equalToConstant: 64),
            iconImageView.heightAnchor.constraint(equalToConstant: 64),

            titleLabel.topAnchor.constraint(equalTo: iconImageView.bottomAnchor, constant: 16),
            titleLabel.leadingAnchor.constraint(equalTo: offlineView.leadingAnchor, constant: 32),
            titleLabel.trailingAnchor.constraint(equalTo: offlineView.trailingAnchor, constant: -32),

            messageLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 8),
            messageLabel.leadingAnchor.constraint(equalTo: offlineView.leadingAnchor, constant: 32),
            messageLabel.trailingAnchor.constraint(equalTo: offlineView.trailingAnchor, constant: -32),

            retryButton.topAnchor.constraint(equalTo: messageLabel.bottomAnchor, constant: 24),
            retryButton.centerXAnchor.constraint(equalTo: offlineView.centerXAnchor),
            retryButton.widthAnchor.constraint(equalToConstant: 160),
            retryButton.heightAnchor.constraint(equalToConstant: 48)
        ])
    }

    @objc private func retryTapped() {
        if isConnected {
            hideOffline()
            if let currentURL = webView.url {
                webView.load(URLRequest(url: currentURL))
            } else {
                loadMainURL()
            }
        } else {
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(.warning)
        }
    }

    private func showOffline() {
        offlineView.isHidden = false
        webView.isHidden = true
    }

    private func hideOffline() {
        offlineView.isHidden = true
        webView.isHidden = false
    }

    private func setupNetworkMonitor() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = (path.status == .satisfied)
            }
        }
        monitor.start(queue: queue)
    }

    private func loadMainURL() {
        let request = URLRequest(url: targetURL, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30)
        webView.load(request)
    }

    // MARK: - WKNavigationDelegate
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        refreshControl.endRefreshing()
        hideOffline()
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        refreshControl.endRefreshing()
        let nsError = error as NSError
        if nsError.code != NSURLErrorCancelled && !isConnected {
            showOffline()
        }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        refreshControl.endRefreshing()
        let nsError = error as NSError
        if nsError.code != NSURLErrorCancelled && !isConnected {
            showOffline()
        }
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }

        let scheme = url.scheme?.lowercased() ?? ""
        let host = url.host?.lowercased() ?? ""

        // Internal app domains
        if host.contains("animeb.ge") || host.contains("spilo.ge") || host == "localhost" {
            decisionHandler(.allow)
            return
        }

        // External app schemes (tel, mailto, whatsapp, viber, app store)
        if ["tel", "mailto", "sms", "whatsapp", "viber"].contains(scheme) {
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            }
            decisionHandler(.cancel)
            return
        }

        if navigationAction.targetFrame == nil {
            webView.load(navigationAction.request)
            decisionHandler(.cancel)
            return
        }

        decisionHandler(.allow)
    }
}
