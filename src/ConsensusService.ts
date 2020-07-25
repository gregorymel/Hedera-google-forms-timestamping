import {
    Client,
    ConsensusMessageSubmitTransaction,
    ConsensusTopicCreateTransaction,
    ConsensusTopicId,
    Ed25519PrivateKey,
    Ed25519PublicKey,
    MirrorClient,
    MirrorConsensusTopicQuery
} from "@hashgraph/sdk";

export class HederaConsensusService {
    private client: Client;
    private operatorPrivateKey: Ed25519PrivateKey;
    private mirrorClient: MirrorClient;

    constructor(operatorPrivateKey: string, private operatorAccount: string, mirrorNodeAddress: string) {
        this.operatorPrivateKey = Ed25519PrivateKey.fromString(operatorPrivateKey);
        this.mirrorClient = new MirrorClient(mirrorNodeAddress);
        this.client = Client.forTestnet();
        this.client.setOperator(operatorAccount, this.operatorPrivateKey);
    }

    public async createTopic(): Promise<string> {
        const transactionId = await new ConsensusTopicCreateTransaction()
            .setTopicMemo("UnSelectiveReporting")
            .execute(this.client);

        const receipt = await transactionId.getReceipt(this.client);
        const subscriptionToken = receipt.getConsensusTopicId();

        return subscriptionToken.toString();
    }

    public getOperatorAccount(): string {
        return this.operatorAccount;
    }

    public async sendMessage(topicId: string, rawMessage: string): Promise<void> {
        const transactionId  = await new ConsensusMessageSubmitTransaction()
            .setTopicId(topicId)
            .setMessage(rawMessage)
            .build(this.client)
            .execute(this.client);

        const receipt = await transactionId.getReceipt(this.client);
        console.log(receipt);
    }

    public registerOnMessage(topicId: string, cb: (message: string) => void): void {
        const subscriptionToken = ConsensusTopicId.fromString(topicId);
        new MirrorConsensusTopicQuery()
            .setTopicId(subscriptionToken)
            .subscribe(
                this.mirrorClient,
                (response) => {
                    cb(response.toString());
                }
                // TODO add error handler
            );
    }

    public unRegisterOnMessage(topicId: string): void {
        // const subscriptionToken = ConsensusTopicId.fromString(topicId);
    }
}
