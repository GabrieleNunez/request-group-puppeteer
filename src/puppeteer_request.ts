import PuppeteerManager from './puppeteer_manager';
import { Request, BaseWebRequest } from 'request-group';
import * as moment from 'moment';
import * as puppeteer from 'puppeteer';

/**
 * This class simplifies creatinga puppeteer request and linking it to a puppeteer manager.
 * Can additionally tie into the request-group library and be batched out
 */
export class PuppeteerRequest extends BaseWebRequest<puppeteer.Page> {
    protected puppeteerManager: PuppeteerManager;
    protected pageUrl: string;

    /**
     * Constructs the request with the specified url  and designated manager
     * @param requestUrl The url we want to load
     * @param puppeteerManager The manager that is going to be responsible for this page
     */
    public constructor(requestUrl: string, puppeteerManager: PuppeteerManager) {
        super(requestUrl);
        this.puppeteerManager = puppeteerManager;
        this.pageData = null;
    }

    /**
     * Frees up the resources used by this request.
     * Specifically closes out the opened puppeteer page that is tied to this request
     */
    public dispose(): Promise<void> {
        return new Promise((resolve): void => {
            (this.pageData as puppeteer.Page).close().then((): void => {
                resolve();
            });
        });
    }

    /**
     * Runs the request and grabs whatever page data if any that it can
     */
    public run(): Promise<Request<puppeteer.Page>> {
        this.momentInitiated = moment();
        this.momentPing = moment();
        return new Promise(
            async (resolve): Promise<void> => {
                if (this.pageData === null) {
                    this.pageData = await this.puppeteerManager.newPage(this.requestUrl);
                } else {
                    await (this.pageData as puppeteer.Page).goto(this.requestUrl);
                }

                this.momentPing = moment();
                this.momentDone = moment();
                this.requestCompleted = true;
                this.momentDuration = moment.duration(this.momentInitiated.diff(this.momentDone));

                resolve(this);
            },
        );
    }
}

export default PuppeteerRequest;
